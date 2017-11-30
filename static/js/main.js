import "babel-polyfill";
import "~/ui";

import Language from "~/models/Language";
import Auth from "~/models/Auth";

// Make global
global.Language = Language;
global.Auth = Auth;

setTimeout(
    console.log.bind(console,
        "%cHi curious developer!%c\nDon't paste anything here that you aren't sure won't hack you.",
        'font-size: 3em; font-weight: bold',
        'font-size: 1em'
    )
);
