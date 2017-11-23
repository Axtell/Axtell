/**
 * Represents a User
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
     * Unwraps a user from an API JSON object.
     * @param {Object} json User JSON object.
     * @return {?User} User object if succesful, `null` if unauthorized.
     * @throws {TypeError} if invalid JSON object
     */
    static fromJSON(json) {
        if (json.unauthorized === true) return null;
        if (!(json['id'] && json['name']))
            throw new TypeError('Invalid input to User#fromJSON');
        
        return new User(
            json.id,
            json.name
        );
    }
}
