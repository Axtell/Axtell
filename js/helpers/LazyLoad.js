import Data from '~/models/Data';

const LazyLoad = {
    resource(element, callbackOrName) {
        return () => new Promise((resolve, reject) => {
            element.addEventListener('load', () => {
                if (typeof callbackOrName === 'string') {
                    resolve(window[callbackOrName]);
                } else if (typeof callbackOrName === 'function') {
                    resolve(callbackOrName());
                } else {
                    resolve();
                }
            });

            element.addEventListener('error', (errorEvent) => {
                reject(errorEvent);
            });

            document.body.appendChild(element);
        });
    },

    stylesheet(url, callbackOrName) {
        return this.resource(
            <link rel="stylesheet" href={url}/>,
            callbackOrName
        );
    },

    script(url, callbackOrName) {
        return this.resource(
            <script type="text/javascript" async="true" src={url}></script>,
            callbackOrName
        );
    },

    onceConcurrent(...asyncFns) {
        let _inProgress = null;

        async function beginLoad() {
            let promises = [];
            for (let i = 0; i < asyncFns.length; i++) {
                promises.push(asyncFns[i]());
            }
            let values = await Promise.all(promises);
            return values[values.length - 1];
        }

        // Return a function that evaluated to promise
        return () => {
            if (_inProgress) {
                return _inProgress;
            } else {
                _inProgress = beginLoad();
                return _inProgress;
            }
        };
    },

    once(...asyncFns) {
        let _inProgress = null;

        async function beginLoad() {
            let result;
            for (let i = 0; i < asyncFns.length; i++) {
                result = await asyncFns[i](result);
            }
            return result;
        }

        // Return a function that evaluated to promise
        return () => {
            if (_inProgress) {
                return _inProgress;
            } else {
                _inProgress = beginLoad();
                return _inProgress;
            }
        };
    }
};

export default LazyLoad;

export const jQuery = LazyLoad.once(
    LazyLoad.script(`https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js`)
);

export const MathQuill = LazyLoad.once(
    LazyLoad.stylesheet(`https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.css`),
    jQuery,
    LazyLoad.script(`https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js`, () => global.MathQuill.getInterface(2))
);
