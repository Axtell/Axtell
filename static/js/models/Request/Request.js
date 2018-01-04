import axios from 'axios';

/**
 * @typedef {Object} HTTPMethod
 * @property {string} GET
 * @property {string} PET
 * @property {string} POST
 * @property {string} DELETE
 */
export const HTTPMethod = {
    GET: 'GET',
    POST: 'POST',
    DELETE: 'DELETE',
    PUT: 'PUT'
}

/**
 * Performs a request for data.
 */
export default class Request {
    /**
     * Formats the request object and returns an object of Request<T>'s T.
     * @param {Object} data - Data (JSON?) from the request.
     * @return {Object} formatted object.
     */
    format(data) { return data; }

    /**
     * Performs the request
     * @return {Promise} resolves to format of object. See return type of
     * {@link Request#format}
     */
    async get() {
        let response = await axios.request({
            method: this._method,
            url: this._path,

            data: this._data,
            headers: this._headers
        });

        return this.format(response.data);
    }

    /**
     * Creates request given path. Provide options **as object**
     *
     * @param {string} path - Path of request
     * @param {string} auth - Authorization header
     * @param {string} contentType - Content type header
     * @param {?Object<string, string>} headers - Additional request headers.
     * @param {Request.Method} [method=get] - Method request type
     */
    constructor({
        path,
        auth,
        data,
        contentType,
        headers = {},
        method = Request.Method.get
    }) {
        this._path = path;
        this._method = method;

        this._data = data;

        this._headers = {
            ...headers,
            'Content-Type': contentType,
            'Authorization': auth
        }
    }
}
