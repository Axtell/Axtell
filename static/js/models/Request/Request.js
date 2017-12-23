import axios from 'axios';

/**
 * Performs a request for data.
 */
export default class Request {
    /**
     * @typedef {Object} Request.Method
     * @property {string} get
     * @property {string} post
     * @property {string} delete
     */
    static Method = {
        get: 'GET',
        post: 'POST',
        delete: 'DELETE'
    }

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
            url: this._path
        });

        return this.format(response.data);
    }

    /**
     * Creates request given path. Provide options **as object**
     *
     * @param {string} path - Path of request
     * @param {Request.Method} [method=get] - Method request type
     */
    constructor({ path, method = Request.Method.get }) {
        this._path = path;
        this._method = method;
    }
}
