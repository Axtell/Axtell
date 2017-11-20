/**
 * Centralizes error handling
 */

export class AnyError {
    constructor(message, id) {
        this.message = message;
        this.id = id;
    }
    
    get idString() {
        return this.id.toString().slice(7, -1);
    }
    
    toString() {
        return this.idString + ": " + this.message;
    }
}

export default {
    /**
     * Raises an error with native throw.
     */
    raise(message, id) {
        throw new AnyError(message, id);
    },

    /**
     * A handled or non-critical error. Logs to console.
     */
    silent(error, message, ...args) {
        let title = "Error:";
        if (error instanceof AnyError) {
            message = error.message + '; ' + message;
            title = error.idString;
        }
        
        console.error(`%c${title}:%c ${message}`, 'font-weight: 700', '', ...args);
    }
};
