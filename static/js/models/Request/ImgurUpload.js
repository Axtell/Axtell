import Request from '~/models/Request/Request';

export const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
export const IMGUR_UPLOAD_ENDPOINT = 'https://api.imgur.com/3/image';

export default class ImgurUpload extends Request {
    /**
     * Returns the URL of the new image
     * @param {Object} data
     * @return {?string}
     */
    format({ data }) {
        return data.link;
    }

    /**
     * Pass as object
     * @param {string} url - URL of imgur thing to upload
     * @param {File} file - File object to upload
     */
    constructor({ url, file } = {}) {
        let data = new FormData();

        if (url) {
            data.append('image', url);
            data.append('type', 'URL');
        }

        if (file) {
            data.append('image', file);
            data.append('type', 'file');
        }

        super({
            path: IMGUR_UPLOAD_ENDPOINT,
            method: Request.Method.post,
            auth: `Client-ID ${IMGUR_CLIENT_ID}`,
            data: data
        });
    }
}
