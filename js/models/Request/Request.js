import axios from 'axios/dist/axios.min.js';
import ErrorManager from '~/helpers/ErrorManager';
import Data from '~/models/Data';

// Get axios setup to intercept
axios.interceptors.response.use((response) => response, (error) => {
    ErrorManager.unhandled(error);
    return Promise.reject(error);
});

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
     * @param {boolean} [format=true] - Set to false to not format
     * @return {Promise} resolves to format of object. See return type of
     * {@link Request#format}
     */
    async run(format = true) {
        let response = await axios.request({
            method: this._method,
            url: this._path,
            data: this._data,
            params: this._params,
            headers: this._headers,
            responseType: this._responseType
        });

        if (format) {
            return this.format(response.data);
        } else {
            return response.data;
        }
    }

    /**
     * Creates request given path. Provide options **as object**
     * @param {Object} requestData - Object describing request. Bare
     *                                  mininmum info is providing path.
     * @param {?string} requestData.host - If cross origin, provide. Specifying will mean NO CSRF token passed
     * @param {string} requestData.path - Path of request
     * @param {string} requestData.auth - Authorization header
     * @param {any} requestData.data - Any data to send as part of request.
     * @param {Object} requestData.formData Automatically converted to form data.
     * @param {?string} requestData.contentType - Content type header
     * @param {?Object} requestData.headers - Additional request headers.
     * @param {HTTPMethod} [requestData.method=get] - Method request type
     */
    constructor({
        host = null,
        path,
        auth,
        data,
        params,
        formData,
        contentType,
        responseType,
        headers = {},
        method = HTTPMethod.GET
    }) {
        this._path = `${host || ""}${path}`;
        this._method = method;
        this._params = params;
        this._responseType = responseType;

        if (formData) {
            let formDataInstance = new FormData();
            for (const [key, value] of Object.entries(formData)) {
                if (value !== null) {
                    formDataInstance.append(key, value);
                }
            }
            this._data = formDataInstance;
        } else {
            this._data = data;
        }

        this._headers = headers;

        if (contentType) this._headers['Content-Type'] = contentType;
        if (auth) this._headers['Authorization'] = auth;
        if (host === null) this._headers['X-CSRF-Token'] = Data.shared.envValueForKey('CSRF');
    }
}
