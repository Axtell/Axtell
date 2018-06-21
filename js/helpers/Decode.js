/**
 * Converts from a base64 json string to a JSON object
 * @param {string} base64string
 * @return {Object}
 */
export function b64toJSON(base64string) {
    return JSON.parse(Buffer.from(base64string, 'base64').toString('utf8'))
}
