import ErrorManager from '~/helpers/ErrorManager';

export const INVALID_JSON = Symbol('User.Error.InvalidJSON');

/**
 * Represents a User
 *
 * @implements {JSONConvertable}
 */
export default class User {
    /**
     * Creates an instance of a user locally.
     * @param  {number} id   Integer uniquely id'ing user.
     * @param  {string} name user display name
     */
    constructor(id, name) {
        this._id = id;
        this._name = name;
    }

    /**
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Unwraps a user from an API JSON object.
     * @param {Object} json User JSON object.
     * @return {?User} User object if succesful, `null` if unauthorized.
     * @throws {TypeError} if invalid JSON object
     */
    static fromJSON(json) {
        if (json.unauthorized === true) return null;
        if (!(json['id'] && json['name']))
            ErrorManager.raise('Invalid input to User#fromJSON', INVALID_JSON);

        return new User(
            json.id,
            json.name
        );
    }

    /** @type {number} */
    static MIN_USERNAME_LENGTH = process.env.MIN_USERNAME_LENGTH

    /** @type {number} */
    static MAX_USERNAME_LENGTH = process.env.MAX_USERNAME_LENGTH

}
