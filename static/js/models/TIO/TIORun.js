import axios from 'axios';
import crypto from 'crypto';
import TIOSerializer from '~/models/TIO/TIOSerializer';
import ErrorManager from '~/helper/ErrorManager';

// Make sure trailing `/` exists
export const TIO_API_ENDPOINT = "https://tio.run/cgi-bin/run/api/";

// Width of IDs
export const TIO_ID_WIDTH = 16;

// No indice in range
export const NoIndice = Symbol('TIO.TIORunError.NoIndice');

/**
 * Runs some code on TIO.
 */
export default class TIORun {
    /**
     * Creates an instance to run some code using TIO
     * @param {string} code Code to run
     * @param {Language} language Language object for language to execute.
     */
    constructor(code, language) {
        this.code = code;
        this.language = language;

        this.token = crypto.randomBytes(16).toString('hex');
    }

    /**
     * Returns a TIOSerializer for the current request
     * @return {TIOSerializer} Fully prepared serialization object with run.
     */
    serializer() {
        let serializer = new TIOSerializer();
        serializer.addVariable('lang', this.language.tioId);
        serializer.addFile('.code.tio', this.code);
        serializer.addFile('.input.tio', '');
        serializer.addVariable('args', []);
        serializer.addRun();
        return serializer;
    }

    async run() {
        let res = await axios.post(
            TIO_API_ENDPOINT + this.token,
            this.serializer().serialize(),
            {
                responseType: 'arraybuffer'
            }
        );

        return new TIOResult(this, res.data);
    }
}

// TODO: Use KMP  or some better algorithm to scan output.
export class TIOResult {
    static Section = {
        Output: 0,
        Debug: 1
    };

    /**
     * Represents the result of a TIO execution.
     *
     * Data is in form:
     *
     * <ID>STDOUT<ID>STDERR<ID>
     *
     * @param {TIORun} request - TIO request creating result.
     * @param {ArrayBuffer} data - TIO result data.
     */
    constructor(request, data) {
        this._request = request;

        this._data = Buffer.from(data);
        this._id = this._data.slice(0, TIO_ID_WIDTH);

        this._stdout = null;
        this._stderr = null;

        this._seperators = null;
    }

    /**
     * All non-error output of TIO request.
     * @type {string}
     */
    get getOutput() {
        if (this._stdout !== null) return this._stdout;
        this._stdout = this._getIndice(TIOResult.Section.Output).toString('utf-8');
        return this._stdout;
    }

    /**
     * Error output of TIO. Empty = no error
     * @type {string}
     */
    get getError() {
        if (this._stderr !== null) return this._stderr;
        this._stderr = this._getIndice(TIOResult.Section.Debug).toString('utf-8');
        return this._stderr;
    }

    /**
     * Checks if there is an error
     * @type {boolean}
     */
    get isError() {
        return this.getError.substr(-1) !== '0';
    }

    // TODO: modify to use KMP
    _findSeperators() {
        this._seperators = [];

        let index;
        do {
            index = this._data.indexOf(this._id, index + TIO_ID_WIDTH);
            this._seperators.push(index);
        } while (index !== -1);
    }

    _getIndice(n) {
        if (this._seperators === null) this._findSeperators();

        let seperatorCount = this._seperators.length;
        if (seperatorCount <= n) {
            ErrorManager.raise(
                `Indice ${n} does not exist. Count is ${seperatorCount}`,
                NoIndice);
        }

        // Returns the matching section
        let section = this._data.slice(
            this._seperators[n] + TIO_ID_WIDTH,
            this._seperators[n + 1]
        );

        return section;
    }
}
