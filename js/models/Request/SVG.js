import Request from '~/models/Request/Request';
import Theme from '~/models/Theme';

const cache = new Map();

/**
 * Loads an SVG
 */
export default class SVG extends Request {
    /** @type {SVGSVGElement} */
    format(data) {
        return data.firstChild;
    }

    /**
     * Intercepts and uses a cache
     * @override
     */
    async run() {
        if (cache.has(this.name)) {
            return cache.get(this.name).cloneNode(true);
        } else {
            const result = await super.run();
            cache.set(this.name, result);
            return result;
        }
    }

    /**
     * Loads an SVG
     * @param {string} name Name of svg
     */
    constructor(name) {
        super({
            path: Theme.light.imageForTheme(name, 'svg'),
            responseType: 'document'
        });

        /** @private */
        this.name = name;
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
