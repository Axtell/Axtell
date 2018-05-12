import Data from '~/models/Data';

export const THEME_DATA_KEY = 'theme';
export const DARK_THEME_ID = 'dark';

export const THEME_IMG_ROOT = '/static/img';

export default class Theme {

    static _current = null;
    static get current() {
        if (this._current === null) {
            return this._current = new Theme(
                Data.shared.valueForKey(THEME_DATA_KEY)
            );
        } else {
            return this._current;
        }
    }

    static _light = null;
    static get light() {
        if (this._light === null) {
            return this._light = new Theme('light');
        } else {
            return this._light;
        }
    }

    /**
     * Creates theme with name
     * @param {string} name
     */
    constructor(name) {
        this._name = name;
    }

    /**
     * Name of the theme
     * @return {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Determines if the theme is a dark theme
     * @return {boolean}
     */
    get isDark() {
        if (this._name === DARK_THEME_ID) return true;
        else return false;
    }

    /**
     * Returns path of static picture with a name given theme.
     * @param {string} name
     * @param {string} type extension of picture
     */
    imageForTheme(name, type = 'svg') {
        if (this.isDark) {
            return `${THEME_IMG_ROOT}/${name}-white.${type}`;
        } else {
            return `${THEME_IMG_ROOT}/${name}.${type}`;
        }
    }
}
