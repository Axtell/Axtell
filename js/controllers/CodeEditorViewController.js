import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import ViewController from '~/controllers/ViewController';
import { CodeMirror as LoadCodeMirror, CodeMirrorMode, CodeMirrorTheme } from '~/helpers/LazyLoad';
import ErrorManager from '~/helpers/ErrorManager';
import Random from '~/modern/Random';

import { fromEvent } from 'rxjs';

export const CodeEditorModeLoadError = Symbol('CodeEditor.Error.ModeLoad');
export const CodeEditorThemeLoadError = Symbol('CodeEditor.Error.ThemeLoad');
export const CodeEditorLoadError = Symbol('CodeEditor.Error.Load');

/**
 * OO-wrapper for a codeeditor.
 */
export default class CodeEditorViewController extends ViewController {
    /**
     * Creates CodeEditor wrapper for element. Reccomended to use a {@link Random}
     * to create a unique name.
     *
     * @param {HTMLTextArea} element element id. If an HTMLElement w/o parent then appending
     * @param {CodeEditorTheme} theme Theme to use for Ace.
     * @param {Object} [opts={}] config opts
     * @param {?number} opts.lines - amont of lines to show
     * @param {?number} opts.autoresize - If to autoresize the box
     */
    constructor(element, theme = CodeEditorTheme.default, { lines = null, autoresize = null } = {}) {
        super();

        return (async () => {
            const CodeMirror = await LoadCodeMirror();
            const opts = {
                lineNumbers: true,
                gutter: true,
                autoRefresh: true
            };

            if (element.parentNode) {
                this._editor = CodeMirror.fromTextArea(element, opts);
            } else {
                await new Promise((resolve, reject) => {
                    this._editor = CodeMirror((el) => {
                        element.appendChild(el);
                        resolve();
                    }, opts);
                });
            }

            this._editor.getWrapperElement().controller = this;

            this._observeValue = fromEvent(this._editor, 'change');

            /**
             * @type {CodeEditorTheme}
             */
            this.theme = CodeEditorTheme.default;

            /** @type {ActionControllerDelegate} */
            this.delegate = new ActionControllerDelegate();

            this._editor.on('change', (editor) => {
                this.delegate.didSetStateTo(this, editor.getValue());
            });

            if (lines) this.lines = lines;
            if (autoresize) this.autoresize = autoresize;

            return this;
        })();
    }

    /**
     * Obtains observable of value
     * @return {Observable}
     */
    observeValue() {
        return this._observeValue;
    }

    /**
     * Formats a widget id
     */
    _widgetId(id, value = "") {
        return `@@axtell:${id}:${value}@@`;
    }

    /**
     * Adds a DOM element as a widget
     * @param {Template} template If it implements CodeEditorWidgetTemplate then delegate didSetState to is overriden
     * @param {string} opts.id an 'id' describes the text value of the node
     */
    addWidget(template, { id }) {
        const generatedId = this._widgetId(id, template.state);
        this._editor.replaceSelection(generatedId, "around");

        var from = this._editor.getCursor("from");
        var to = this._editor.getCursor("to");
        const marker = this._editor.markText(from, to, {
            replacedWith: template.unique(),
            clearWhenEmpty: false
        });

        const updateId = (newId, value) => {
            const pos = marker.find();
            if (pos) {
                pos.from.ch += 1;
                pos.to.ch -= 1;
                this._editor.replaceRange(this._widgetId(newId, value), pos.from, pos.to);
            }
        }

        // Support values on ActionControllerDelegate
        if (template.delegate instanceof ActionControllerDelegate) {
            template.delegate.didSetStateTo = (template, state) => {
                this._editor.refresh();
                updateId(id, state);
            };
        }

        return {
            exists: () => {
                return !!marker.find();
            },
            updateId
        };
    }

    /**
     * If should auto resize (i.e. starts at 1)
     * @type {boolean}
     */
    set autoresize(shouldAutoresize) {
        if (shouldAutoresize) {
            this._editor.getWrapperElement().style.height = 'auto';
            this._editor.setOption('viewportMargin', Infinity);
        } else {
            this._editor.setOption('viewportMargin', 10);
        }
    }

    /**
     * Sets the height in the # of lines that should be shown
     * @type {nuumber}
     */
    set lines(lineCount) {
        this._editor.setOption('viewportMargin', lineCount);
    }

    /**
     * Returns value of editor
     * @type {string}
     */
    get value() {
        return this._editor.getValue();
    }

    /**
     * Sets the value of the editor
     * @type {string}
     */
    set value(value) {
        return this._editor.setValue(value);
    }

    /**
     * Sets the theme given a type
     * @param {CodeEditorThemeType} type Type of theme
     */
    async setThemeType(type) {
        const themeName = this.theme.nameForType(type);
        try {
            await CodeMirrorTheme(themeName)
        } catch(error) {
            ErrorManager.raise(
                `Failed to load theme ${themeName}`,
                CodeEditorThemeLoadError
            );
        }
        this._editor.setOption('theme', themeName);
    }

    /**
     * Sets the language if possible
     * @param {?Language|string} lang - Language object. Null if default
     */
    async setLanguage(lang) {
        if (lang?.cmName) {
            try {
                await CodeMirrorMode(lang.cmName); // Loads the mode
                this._editor.setOption('mode', lang.cmName);
            } catch(error) {
                ErrorManager.raise(
                    `Failed to load language ${lang.id} of CodeMirror name ${lang.cmName}`,
                    CodeEditorModeLoadError
                );
            }
        } else if (lang && typeof lang === 'object' ? lang.name : typeof lang === 'string') {
            // either { name: something } or 'str'
            this._editor.setOption('mode', lang);
        } else {
            this._editor.setOption('mode');
        }
    }

    /**
     * Checks if should be validated
     * @type {boolean}
     */
    set shouldValidate(should) {
        /* No validation atm */
    }
}

/**
 * Type of theme
 * @typedef {Object} CodeEditorThemeType
 */
export const CodeEditorThemeType = {
    Dark: Symbol('CodeEditor.ThemeType.Dark'),
    Light: Symbol('CodeEditor.ThemeType.Light'),

    /**
     * From a {@link Theme}
     * @param  {Theme} theme Theme file
     * @return {CodeEditorThemeType} respective theme type.
     */
    fromTheme(theme) {
        if (theme.isDark) return this.Dark;
        else return this.Light;
    }
}

export class CodeEditorTheme {
    /**
     * Creates a new Ace theme.
     *
     * @param {Object} opts Theme config
     * @param {string} opts.CodeEditorThemeType.Light LightTheme
     * @param {string} opts.CodeEditorThemeType.Light Dark theme
     */
    constructor(themes) {
        /** @type {Object} */
        this.themes = themes;
    }

    /**
     * Returns name for theme type
     * @param {CodeEditorThemeType} type - type of ace theme
     * @return {string} theme name
     */
    nameForType(type) {
        let theme = this.themes[type];
        if (typeof theme === 'undefined') ErrorManager.raise(`Invalid theme`, BadCodeEditorThemeType);
        return theme;
    }

    /**
     * Default CodeEditorTheme using tomorrow theme.
     * @type {CodeEditorTheme}
     */
    static default = new CodeEditorTheme({
        [CodeEditorThemeType.Light]: "default",
        [CodeEditorThemeType.Dark]: "monokai"
    });
}

export const BadCodeEditorThemeType = Symbol('CodeEditor.ThemeType.Error.BadType');
