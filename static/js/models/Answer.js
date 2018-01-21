import ErrorManager from '~/helpers/ErrorManager';
import Language from '~/models/Language';
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
     * @param {?string} answer.commentary
     * @param {?number} answer.length
     * @param {?Language} answer.language
     * @param {User} answer.user
     */
    constructor({ code, encoding, length, language, commentary, user }) {
        this._code = code;
        this._encoding = encoding;
        this._commentary = commentary;
        this._length = length;
        this._language = language;
        this._user = user;
    }

    /**
     * Language of ans
     * @type {?Language}
     */
    get language() { return this._language; }

    /**
     * Returns length of answer
     * @type {?number}
     */
    get length() {
        return this._length || (this._code ? this._code.length : null)
    }

    /**
     * Returns the code
     * @type {string}
     */
    get code() { return this._code; }

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
            lang: language,
            byte_len: length,
            owner
        } = json;

        if (!encoding || !owner) {
            ErrorManager.raise(`Incomplete Answer JSON`, INVALID_JSON);
        }

        return new Answer({
            code,
            encoding,
            commentary,
            language: Language.fromJSON(language),
            length,
            user: User.fromJSON(owner)
        });
    }
}
