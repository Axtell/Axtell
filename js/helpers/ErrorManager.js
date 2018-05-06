/**
 * Centralizes error handling
 */

import Data from '~/models/Data';

const ErrorList = [];

/**
 * Generic error type
 */
export class AnyError {
    /**
     * @param {string} message Error descrpition
     * @param {Symbol|string} id Id of error
     */
    constructor(message, id) {
        this.message = message;
        this.id = typeof id === 'symbol' ? id.toString().slice(7, -1) : id;
    }

    get idString() {
        return this.id;
    }

    toString() {
        return this.id + ": " + this.message;
    }

    /**
     * Reports the error with some args.
     * @param {Array} args anything
     */
    report(...args) {
        ErrorList.push(this);
        console.error(`%c${this.idString}:%c ${this.message}`, 'font-weight: 700', '', ...args);
        console.log(
            `This error has been reported, your instance id is %c${Data.shared.dataId}%c.` +
            'font-family: Menlo, "Fira Mono", monospace;', ''
        );
    }
}

// Helper to report rollbar
function report_rollbar(level, message, args) {
    const user = Data.shared.valueForKey('user') || 'unauthorized';
    const instanceId = Data.shared.dataId;

    Rollbar[level](message, {
        instance: instanceId,
        user,
        ...args
    });
}

export class ErrorManager {
    /**
     * Raises an error with native throw.
     * @param {string} message
     * @param {Symbol|string} id - Error id string or symbol.
     */
    raise(message, id) {
        throw new AnyError(message, id);
    }

    /**
     * Warns an AnyError
     * @param {string} message
     * @param {Symbol|string} id Describes the type
     */
    warn(message, id) {
        console.warn(new AnyError(message, id).toString());
    }

    /**
     * A handled or non-critical error. Logs to console.
     *
     * @param {Error|AnyError} error - The error object caught.
     * @param {string} message - Describes the error
     * @param {Array} args - Any other spread arguments that should be provided.
     */
    silent(error, message, ...args) {
        let title = "Error";
        if (error instanceof AnyError) {
            message = error.message + '; ' + message;
            title = error.idString;
        } else if (error.name) {
            title = error.name;
            args.unshift(error);
        }

        const err = new AnyError(message, title);

        if (window.Rollbar) {
            report_rollbar('warning', err.toString(), { data: args });
        }

        err.report(...args);
    }

    /**
     * Reports an error
     * @param {Error|AnyError} error - An error to directly report
     */
    report(error) {
        if (error instanceof AnyError) {
            report_rollbar('error', error.toString());
            error.report();
        } else {
            this.unhandled(error);
        }
    }

    /**
     * Pass unhandled errors here
     * @param {Error|AnyError} error - An unhandled error to report.
     */
    unhandled(error) {
        if (window.rollbar) {
            report_rollbar('error', error)
        }

        new AnyError(error.message, 'Unhandled Error').report(error, error.stack);
    }

    /**
     * Returns errors
     * @return {string}
     */
    dump() {
        return `Error Dump for instance ${Data.shared.dataId}:\n\n` +
            ErrorList.map((error, indexNum) => {
                let index = String(indexNum);

                return ` ${indexNum + 1}. ${error.idString}\n` +
                    ` ${" ".repeat(index.length)}  ${error.message}`;
            }).join(`\n\n`);
    }

    /**
     * Dumps in new context
     */
    dumpText() {
        window.open(
            `data:text/plain,${encodeURIComponent(this.dump())}`,
            '_blank'
        );
    }

    /**
     * Dumps error log to console.
     */
    dumpConsole() {
        console.log(
            `%cError Dump%c for instance (%c${Data.shared.dataId}%c):%c\n` +
            ErrorList.map(
                (error, indexNum) => {
                    let index = String(indexNum);

                    return `%c${indexNum + 1}. %c${error.idString}%c\n` +
                        `%c${" ".repeat(index.length)}  ${error.message}%c`;
                }
            ).join('\n'),
            'font-size: 24px; font-weight: bold;', 'font-size: 24px;',
            'font-size: 24px; font-weight: bold; text-decoration: underline', 'font-size: 24px;', '',
            ...[].concat(...ErrorList.map(_ => [
                'font-size: 16px;',
                'color: red; font-weight: bold; font-size: 16px;', '',
                'font-size: 14px;', ''
            ]))
        );
    }
}

ErrorManager.shared = new ErrorManager();
export default ErrorManager.shared;
