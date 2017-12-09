import ErrorManager from '~/helper/ErrorManager';

/**
 * OO-wrapper for Ace code editor.
 */
export default class Ace {
    /**
     * Creates Ace wrapper for element. Reccomended to use a {@link HexBytes}
     * to create a unique name.
     *
     * @param {string} element element id.
     * @param {AceTheme} theme Theme to use for Ace.
     */
    constructor(element, theme = AceTheme.default) {
        this._editor = ace.edit(element);

        /**
         * @type {AceTheme}
         */
        this.theme = theme;
    }

    /**
     * Sets the theme given a type
     * @param {AceThemeType} type Type of theme
     */
    setThemeType(type) {
        this._editor.setTheme(`ace/mode/${this.theme.nameForType(type)}`);
    }

    /**
     * Sets the language if possible
     * @param {Language} lang - Language object
     */
    setLanguage(lang) {
        let name = lang.aceName || "text";
        this._editor.session.setMode(`ace/mode/${name}`);
    }

    /**
     * Checks if should be validated
     * @type {boolean}
     */
    set shouldValidate(should) {
        this._editor.session.setOption("useWorker", should);
    }
}

export class AceTheme {
    /**
     * Creates a new Ace theme.
     *
     * @param {Object} opts Theme config
     * @param {string} opts.lightTheme LightTheme
     * @param {string} opts.darkTheme  Dark theme
     */
    constructor({ lightTheme, darkTheme } = {}) {
        this.lightTheme = lightTheme;
        this.darkTheme = darkTheme;
    }

    /**
     * Returns name for theme type
     * @param {AceThemeType} type - type of ace theme
     * @return {string} theme name
     */
    nameForType(type) {
        switch (type) {
            case AceThemeType.Dark: return this.darkTheme;
            case AceThemeType.Light: return this.lightTheme;
            default: ErrorManager.raise(`Invalid theme`, BadAceThemeType)
        }
    }

    /**
     * Default AceTheme using tomorrow theme.
     * @type {AceTheme}
     */
    static default = new AceTheme({
        lightTheme: "tomorrow",
        darkTheme: "tomorrow_night_eighties"
    });
}

/**
 * Type of theme
 * @typedef {Object} AceThemeType
 */
export const AceThemeType = {
    Dark: Symbol('Ace.ThemeType.Dark'),
    Light: Symbol('Ace.ThemeType.Light')
}

export const BadAceThemeType = Symbol('Ace.ThemeType.Error.BadType');
