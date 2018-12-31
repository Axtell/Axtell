import ErrorManager from '~/helpers/ErrorManager';
import Language from '~/models/Language';
import Data, { EnvKey } from '~/models/Data';
import User from '~/models/User';
import Post from '~/models/Post';

export const INVALID_JSON = Symbol('User.Error.InvalidJSON');

/**
 * An answer to a challenge
 * @implements {JSONConvertable}
 */
export default class Answer {
    /**
     * Creates an answer from an answer config object
     * @param {Object} answer
     * @param {number} answer.id
     * @param {?string} answer.code
     * @param {?string} answer.encoding
     * @param {boolean} [answer.deleted=false]
     * @param {?string} answer.commentary
     * @param {?number} answer.length
     * @param {?Language} answer.language
     * @param {User} answer.user
     * @param {?Post} answer.post Parent post
     * @param {?Date} answer.dateCreated
     * @param {?Date} answer.dateModified
     */
    constructor({ id, code, encoding, deleted = false, length, language, commentary, user, post, dateCreated, dateModified }) {
        this._id = id;
        this._code = code;
        this._encoding = encoding;
        this._deleted = deleted;
        this._commentary = commentary;
        this._length = length;
        this._language = language;
        this._user = user;
        this._post = post;
        this._dateCreated = dateCreated;
        this._dateModified = dateModified;
    }

    /**
     * Clones and returns a new copy of the answer. This is not deep
     * @return {Answer} a copy
     */
    clone() {
        return new Answer({
            id: this._id,
            code: this._code,
            encoding: this._encoding,
            commentary: this._commentary,
            length: this._length,
            language: this._language,
            user: this._user
        });
    }

    /**
     * @type {?Date}
     */
    get dateCreated() { return this._dateCreated; }

    /**
     * @type {?Date}
     */
    get dateModified() { return this._dateModified; }

    /**
     * @type {?Post}
     */
    get post() { return this._post; }

    /**
     * @type {number}
     */
    get id() { return this._id }

    /**
     * General endpoint for this type of model
     * @type {string}
     */
    get endpoint() { return 'answer' }

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
     * Sets the code
     * @type {string}
     */
    set code(code) {
        // TODO: support encodings
        this._length = [...code].length;
        this._code = code;
    }

    /**
     * Returns owner of the answer
     * @type {User}
     */
    get user() { return this._user; }

    /**
     * Gets if deleted
     */
    get isDeleted() { return this._deleted; }

    /**
     * Gets if deleted
     */
    set isDeleted(isDeleted) { this._deleted = isDeleted; }

    /**
     * URL of answer
     * @return {string}
     */
    get url() {
        return `${Data.shared.envValueForKey(EnvKey.host)}/answer/${this.id}`;
    }

    /**
     * Converts to json
     * @return {Object} json object
     */
    toJSON() {
        return {
            type: 'answer',
            id: this.id,
            owner: this.user.toJSON(),
            code: this.code,
            deleted: this.isDeleted,
            byte_len: this.length,
            lang: this.language
        };
    }

    /**
     * Unwraps from serach Index JSON object
     * @param {Object} JSON Search index JSON
     * @return {?User} Created object
     */
    static fromIndexJSON(json) {
        return new Answer({
            id: json.id,
            code: json.code,
            deleted: false,
            length: json.byte_count,
            language: Language.fromJSON(json.language),
            user: User.fromIndexJSON(json.author),
            dateCreated: new Date(json.date_created),
            dateModified: new Date(json.last_modified),
            post: new Post({ postId: json.post.id, title: json.post.name, slug: json.post.slug })
        });
    }

    /**
     * Unwraps from an API JSON object.
     * @param {Object} json User JSON object.
     * @return {?Answer} object if succesful, `null` if unauthorized.
     * @throws {TypeError} if invalid JSON object
     */
    static fromJSON(json) {
        // Unwrap all json parameters
        const {
            id,
            code = null,
            encoding = "utf8",
            commentary = "",
            lang: language,
            deleted = false,
            byte_len: length,
            owner
        } = json;

        if (!owner) {
            ErrorManager.raise(`Incomplete Answer JSON`, INVALID_JSON);
        }

        return new Answer({
            id,
            code,
            encoding,
            commentary,
            deleted,
            language: Language.fromJSON(language),
            length,
            user: User.fromJSON(owner)
        });
    }
}
