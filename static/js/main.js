// Polyfills
import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'element-dataset';

import Normalize from "~/models/Normalize";
import Language from "~/models/Language";
import Post from "~/models/Post";
import Data from "~/models/Data";
import Auth from "~/models/Auth";

import Request from "~/models/Request/Request";
import Leaderboard from "~/models/Request/Leaderboard";

// Make global
global.Normalize = Normalize;
global.Language = Language;
global.Post = Post;
global.Data = Data;
global.Auth = Auth;

global.Request = Request;
global.Leaderboard = Leaderboard;

(function(done) {
    // Only need to be able to access DOM
    if (document.readyState !== 'loading') {
        done();
    } else {
        document.addEventListener("DOMContentLoaded", done);
        document.addEventListener("load", done);
    }
}(function(state) {
    return function() {
        if (state === false) {
            state = true;
            require("~/ui");
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
