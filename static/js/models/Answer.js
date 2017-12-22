import ErrorManager from '~/helper/ErrorManager';
import User from '~/models/User';

export const INVALID_JSON = Symbol('User.Error.InvalidJSON');

/**
 * An answer to a challenge
 * @implements {JSONConvertable}
 */
export default class Answer {
    /**
     * Creates an answer from an answer config object
     * @param {Object} answer
     * @param {?string} answer.code
     * @param {string} answer.encoding
     * @param {string} answer.commentary
     * @param {?Language} answer.language
     * @param {User} answer.user
     */
    constructor({ code, encoding, language, commentary, user }) {
        this._code = code;
        this._encoding = encoding;
        this._commentary = commentary;
        this._language = language;
        this._user = user;
    }

    /**
     * Language of ans
     * @type {?Language}
     */
    get language() { return this._language; }

    /**
     * Returns the code
     * @type {string}
     */
    get code() { return this._code; }

    /**
     * Returns the calculated length of the answer
     * @type {?number}
     */
    get length() {
        if (this._code === null) return null;
        return this._code.length;
    }

    /**
     * Returns owner of the answer
     * @type {User}
     */
    get user() { return this._user; }

    /**
     * Unwraps from an API JSON object.
     * @param {Object} json User JSON object.
     * @return {?Answer} object if succesful, `null` if unauthorized.
     * @throws {TypeError} if invalid JSON object
     */
    static fromJSON(json) {
        // Unwrap all json parameters
        const {
            code = null,
            encoding,
            commentary = "",
            language,
            owner
        } = json;

        if (!encoding || !owner) {
            ErrorManager.raise(`Incomplete Answer JSON`, INVALID_JSON);
        }

        return new Answer({
            code,
            encoding,
            commentary,
            language,
            user: User.fromJSON(owner)
        });
    }
}
