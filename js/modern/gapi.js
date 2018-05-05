((gapi) => {

    gapi.loadAsync = (module) => new Promise((resolve, reject) => {
        gapi.load(module, resolve);
    });

})(window.gapi || {});
