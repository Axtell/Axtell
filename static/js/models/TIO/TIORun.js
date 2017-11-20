import axios from'axios';

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
    }
    
    async run() {
        return new TIOResult(this, "", "");
    }
}

export class TIOResult {
    /**
     * Represents the result of a TIO execution.
     * @param {TIORun} request - TIO request creating result.
     * @param {string} stdout Output code.
     * @param {string} stderr Error code.
     */
    constructor(request, stdout, stderr = "") {
        this._request = request;
        this._stdout = stdout;
        this._stderr = stderr;
    }
    
    /**
     * All non-error output of TIO request.
     * @type {string}
     */
    get getOutput() { return this._stdout; }
    
    /**
     * Error output of TIO. Empty = no error
     * @type {string}
     */
    get getError() { return this._stderr; }
    
    /**
     * Checks if there is an error
     * @type {boolean}
     */
    get isError() { return this._stderr.length > 0; }
}
