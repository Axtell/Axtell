import Request from '~/models/Request/Request';
import Theme from '~/models/Theme';

/**
 * Loads an SVG
 */
export default class SVG extends Request {
    /** @type {SVGSVGElement} */
    format(data) {
        return data.firstChild;
    }

    /**
     * Loads an SVG
     * @param {string} name Name of svg
     */
    constructor(name) {
        super({
            path: Theme.light.imageForTheme(name, 'svg'),
            responseType: 'document'
        })
    }

    /**
     * Loads an SVG
     * @param {string} name
     * @return {SVGSVGElement}
     */
    static async load(name) {
        return await new SVG(name).run();
    }
}
