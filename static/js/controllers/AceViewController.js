import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import ViewController from '~/controllers/ViewController';
import ErrorManager from '~/helpers/ErrorManager';

const oop = ace.require("ace/lib/oop");

/**
 * OO-wrapper for Ace code editor.
 */
export default class AceViewController extends ViewController {
    /**
     * Creates Ace wrapper for element. Reccomended to use a {@link HexBytes}
     * to create a unique name.
     *
     * @param {string} element element id.
     * @param {AceTheme} theme Theme to use for Ace.
     * @param {Object} customRules Custon rules if any
     */
    constructor(element, theme = AceTheme.default, customRules) {
        super();

        this._editor = ace.edit(element);
        this._editor.container.controller = this;

        this._editor.session.setNewLineMode('unix');

        /**
         * @type {AceTheme}
         */
        this.theme = theme;

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();

        /** @type {Object} */
        this.customRules = customRules;

        this.setLanguage('text');
    }

    /**
     * Returns value of editor
     * @type {string}
     */
    get value() {
        return this._editor.session.getValue();
    }

    /**
     * Sets the value of the editor
     * @type {string}
     */
    set value(value) {
        return this._editor.session.setValue(value);
    }

    /**
     * Sets the theme given a type
     * @param {AceThemeType} type Type of theme
     */
    setThemeType(type) {
        this._editor.setTheme(`ace/theme/${this.theme.nameForType(type)}`);
    }

    /**
     * Sets the language if possible
     * @param {Language} lang - Language object
     */
    setLanguage(lang) {
        // No this is not the same as a ternary
        let name = (lang && lang.aceName) || "text";

        const Mode = ace.config.loadModule(["mode", `ace/mode/${name}`], ({ Mode }) => {
            const mode = new Mode();

            // Fixes race condition
            let highlightRules = this._highlighter(new (mode.HighlightRules)());
            oop.inherits(highlightRules, mode.HighlightRules);
            mode.HighlightRules = highlightRules;
            this._editor.session.setMode(mode);
        });
    }

    /**
     * Manages sub ace highlighting
     */
    _highlighter(base) {
        let self = this;
        return function() {
            Object.assign(this, base);

            if (self.customRules) {
                for (const [ruleName, tokens] of Object.entries(self.customRules)) {
                    for (const token of tokens) {
                        this.$rules[ruleName].unshift(token);
                    }
                }
            }

            this.normalizeRules();
        }
    }

    /**
     * Checks if should be validated
     * @type {boolean}
     */
    set shouldValidate(should) {
        this._editor.session.setOption("useWorker", should);
    }
}

/**
 * Type of theme
 * @typedef {Object} AceThemeType
 */
export const AceThemeType = {
    Dark: Symbol('Ace.ThemeType.Dark'),
    Light: Symbol('Ace.ThemeType.Light'),

    /**
     * From a {@link Theme}
     * @param  {Theme} theme Theme file
     * @return {AceThemeType} respective theme type.
     */
    fromTheme(theme) {
        if (theme.isDark) return this.Dark;
        else return this.Light;
    }
}

export class AceTheme {
    /**
     * Creates a new Ace theme.
     *
     * @param {Object} opts Theme config
     * @param {string} opts.AceThemeType.Light LightTheme
     * @param {string} opts.AceThemeType.Light Dark theme
     */
    constructor(themes) {
        /** @type {Object} */
        this.themes = themes;
    }

    /**
     * Returns name for theme type
     * @param {AceThemeType} type - type of ace theme
     * @return {string} theme name
     */
    nameForType(type) {
        let theme = this.themes[type];
        if (!theme) ErrorManager.raise(`Invalid theme`, BadAceThemeType);
        return theme;
    }

    /**
     * Default AceTheme using tomorrow theme.
     * @type {AceTheme}
     */
    static default = new AceTheme({
        [AceThemeType.Light]: "tomorrow",
        [AceThemeType.Dark]: "tomorrow_night_eighties"
    });
}

export const BadAceThemeType = Symbol('Ace.ThemeType.Error.BadType');
