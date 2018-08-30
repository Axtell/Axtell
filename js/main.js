// Polyfills
import 'url-search-params-polyfill';
import 'element-dataset';

import '~/modern/GeneratorExtensions';

// /* from CDN */ import bugsnag from 'bugsnag-js';
import tippy from 'tippy.js/dist/tippy.all.min.js';

import KeyManager from "~/models/KeyManager";
import Data from "~/models/Data";
import Auth from "~/models/Auth";

import ErrorManager, * as ErrorData from "~/helpers/ErrorManager";
import Analytics, { TimingType } from "~/models/Analytics";

import '~/interactors/GlobalTriggers';

// Manage unhandled errors through manager
window.addEventListener("unhandledrejection", (error) => {
    ErrorManager.unhandled(error.reason);
});

// This is a bunch of code which ensures that the UI code is called
// as early as possible but never before and only once.
(function(done) {
    // Only need to be able to access DOM
    if (document.readyState !== 'loading') {
        done();
    } else {
        document.addEventListener("DOMContentLoaded", done);
        document.addEventListener("load", done);
    }
}(function(state) {
    // This ensures that we only load once
    return function() {
        if (state === false) {
            // Make global
            const IS_DEBUG = Data.shared.envValueForKey('IS_DEBUG');
            const Classes = {
                Data,
                Auth,
                ErrorManager,
                ErrorData
            };

            if (IS_DEBUG) {
                Object.assign(global, Classes);
            }

            global.Axtell = {
                requestAccess: async ({ name = 'A program' } = {}) => {
                    const didAllow = confirm(`${name} would like access to your Axtell frontend. Do you wish to provide access?`)
                    if (didAllow) {
                        return Classes;
                    } else {
                        return null;
                    }
                }
            };

            state = true;
            try {

                Analytics.shared?.reportTime(
                    TimingType.pageLoad,
                    Math.round(performance.now())
                );

                console.log(
                    `🏔 Axtell: Preparing Instance %c${Data.shared.dataId}%c`,
                    'font-family: Menlo, "Fira Mono", monospace;', ''
                );

                import("./ui")
                    .then(() => console.log("🏔 Axtell: Loaded"))
                    .then(() => Auth.shared)
                    .then(() => {
                        document.documentElement.classList.add('axtell-ready');
                    })
                    .catch(error => {
                        ErrorManager.unhandled(error);
                        console.log("🏔 Axtell: Error")
                    });
            } catch(error) {
                ErrorManager.unhandled(error);
            }
        }
    };
}(false)));

setTimeout(
    console.log.bind(console,
        "%cHi curious developer!%c\nDon't paste anything here that you aren't sure won't hack you.",
        'font-size: 3em; font-weight: bold',
        'font-size: 1em'
    )
);

tippy('.tooltip', {
    arrow: true,
    animateFill: false,
    duration: [150, 250],
    size: 'small'
});
