import Data from '~/models/Data';

const cache = new Set();

const LazyLoad = {
    resource(element, url) {
        return () => new Promise((resolve, reject) => {
            if (cache.has(url)) {
                resolve();
                return;
            }

            element.addEventListener('load', () => {
                cache.add(url);
                resolve();
            });

            element.addEventListener('error', (errorEvent) => {
                reject(errorEvent);
            });

            document.body.appendChild(element);
        });
    },

    stylesheet(url) {
        return this.resource(
            <link rel="stylesheet" href={url} media="none" onload="this.media='all'"/>,
            url
        );
    },

    script(url) {
        return this.resource(
            <script type="text/javascript" async="true" src={url}></script>,
            url
        )
    },

    resolveValue(callbackOrName) {
        return async () => {
            if (typeof callbackOrName === 'string') {
                return window[callbackOrName];
            } else if (typeof callbackOrName === 'function') {
                return callbackOrName();
            }
        };
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

export const jQuery =
    LazyLoad.script(`https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js`);

export const Chartist = LazyLoad.once(
    LazyLoad.stylesheet(`https://cdnjs.cloudflare.com/ajax/libs/chartist/0.11.0/chartist.min.css`),
    LazyLoad.script(`https://cdnjs.cloudflare.com/ajax/libs/chartist/0.11.0/chartist.min.js`)
);

export const CodeMirrorTheme = (theme) => (
    theme && theme !== 'default'
    ? LazyLoad.stylesheet(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.38.0/theme/${theme}.min.css`)()
    : LazyLoad.stylesheet(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.38.0/codemirror.min.css`)
);

export const CodeMirrorCLikeModes = ["text/x-csrc", "text/x-c++src", "text/x-java", "text/x-csharp", "text/x-objectivec", "text/x-scala", "text/x-vertex", "x-shader/x-fragment", "text/x-squirrel", "text/x-ceylon"];
export const CodeMirrorMode = (name) => {
    if (CodeMirrorCLikeModes.includes(name)) {
        return CodeMirrorMode('clike')
    } else {
        const urlName = name.match(/[a-z]+$/)[0];
        return LazyLoad.script(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.38.0/mode/${urlName}/${urlName}.min.js`)()
    }
};

export const CodeMirrorOverlay = LazyLoad.once(
    LazyLoad.script(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.39.0/addon/mode/overlay.min.js`)
);

export const CodeMirror = LazyLoad.once(
    CodeMirrorTheme(),
    LazyLoad.script(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.38.0/codemirror.js`),
    LazyLoad.script(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.38.0/addon/display/autorefresh.min.js`),
    LazyLoad.resolveValue('CodeMirror')
);

export const MathQuill = LazyLoad.once(
    LazyLoad.stylesheet(`https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.css`),
    jQuery,
    LazyLoad.script(`https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js`),
    LazyLoad.resolveValue(() => global.MathQuill.getInterface(2))
);
