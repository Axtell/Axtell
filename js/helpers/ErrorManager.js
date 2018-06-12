/**
 * Centralizes error handling
 */

import Data from '~/models/Data';

const ErrorList = [];

export let Bugsnag = null;

const BugsnagKey = Data.shared.envValueForKey('BUGSNAG');
if (BugsnagKey) {
    Bugsnag = bugsnag({
        apiKey: BugsnagKey,
        appVersion: Data.shared.envValueForKey('VERSION'),
        autoCaptureSessions: true,
        autoBreadcrumbs: true,
        networkBreadcrumbsEnabled: true,
        beforeSend: (report) => {
            report.user.instance_id = Data.shared.dataId;
        }
    });
    Bugsnag.metaData = {};
}

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

        // Stores stack trace
        this.jsError = new Error(message);
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
            `This error has been reported, your instance id is %c${Data.shared.dataId}%c.`,
            'font-family: Menlo, "Fira Mono", monospace;', ''
        );
    }
}

// Helper to report rollbar
function report_manager(level, err) {
    if (err instanceof AnyError) {
        Bugsnag?.notifyException(
            err.jsError,
            {
                name: err.toString(),
                severity: level
            }
        );
    } else {
        Bugsnag?.notify(err, {
            severity: level
        })
    }
}

export class ErrorManager {
    /**
     * Raises an error with native throw.
     * @param {string} message
     * @param {Symbol|string} id - Error id string or symbol.
     */
    raise(message, id) {
        const error = new AnyError(message, id);
        report_manager('error', error);
        throw error;
    }

    /**
     * Warns an AnyError
     * @param {string} message
     * @param {Symbol|string} id Describes the type
     */
    warn(message, id) {
        const error = new AnyError(message, id);
        report_manager('warning', error);
        console.warn(error.toString());
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
        if (error.stack) {
            err.jsError = error;
        }

        report_manager('warning', err);

        err.report(...args);
    }

    /**
     * Reports an error
     * @param {Error|AnyError} error - An error to directly report
     */
    report(error) {
        if (error instanceof AnyError) {
            report_manager('error', error);
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
        report_manager('error', error);
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
