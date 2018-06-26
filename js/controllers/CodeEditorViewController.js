import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import ViewController from '~/controllers/ViewController';
import { CodeMirror as LoadCodeMirror, CodeMirrorMode, CodeMirrorTheme } from '~/helpers/LazyLoad';
import ErrorManager from '~/helpers/ErrorManager';

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
     */
    constructor(element, theme = CodeEditorTheme.default) {
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

            /**
             * @type {CodeEditorTheme}
             */
            this.theme = CodeEditorTheme.default;

            /** @type {ActionControllerDelegate} */
            this.delegate = new ActionControllerDelegate();

            return this;
        })();
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
     * @param {?Language} lang - Language object. Null if default
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
