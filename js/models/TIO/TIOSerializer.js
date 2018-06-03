/**
 * TIO uses very-specific format so this serializes things to work for it. This
 * is a JS API so this handles all encoding.
 */
export default class TIOSerializer {
    /**
     * Serializer with empty state
     */
    constructor() {
        /** @private */
        this.data = [];
    }

    /**
     * Writes a variable to the data.
     *
     * @param {string} name - UTF-16 encoded name
     * @param {string[]|data} data - List of data for this variable.
     */
    addVariable(name, data) {
        if (!(data instanceof Array)) data = [data];
        let buffer = 'V' + name + '\0' + (data.length >>> 0) + '\0';

        for (let i = 0; i < data.length; i++) {
            buffer += data[i] + '\0';
        }

        this.data.push(Buffer.from(buffer, 'utf8'));
    }

    /**
     * Writes a file to the data.
     *
     * @param {string} filename - Name of file (UTF-16)
     * @param {string} data - UTF-16 encoded file data.
     */
    addFile(filename, data) {
        let buffer = 'F' + filename + '\0' + (Buffer.byteLength(data, 'utf8') >>> 0) + '\0' + data;
        this.data.push(Buffer.from(buffer, 'utf8'));
    }

    /**
     * Should be placed last. Adds a run command.
     */
    addRun() {
        this.data.push(Buffer.from('R'))
    }

    /**
     * Serializes to a TIO-string the given instructions.
     * @return {Uint8Array} Returns a `Uint8Array` compatible object
     */
    async serialize() {
        const pako = await import('pako');
        return pako.deflateRaw(Buffer.concat(this.data), {"level": 9});
    }
}
