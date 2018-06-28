import LazyLoad, { CodeMirror as CM, CodeMirrorOverlay, CodeMirrorMode } from '~/helpers/LazyLoad';

const AxtellPlaceholder = /@@axtell:([a-z]+)@@/;

export default LazyLoad.once(
    CM,
    CodeMirrorOverlay,
    async () => {
        CodeMirror.defineMode("axtell", function(config, parserConfig) {
            return CodeMirror.overlayMode(
                CodeMirror.getMode(config, parserConfig.sourceLanguage), {
                token: function(stream, state) {
                    let results;
                    if (results = stream.match(AxtellPlaceholder)) {
                        let name = results[1];
                        return `axtell-template-${name}`;
                    }

                    while (stream.next() != null && !stream.match(AxtellPlaceholder, false)) {}
                    return null;
                }
            });
        });
    },
    LazyLoad.resolveValue(() => async (language) => {
        const codeMirrorName = language.cmName || null;
        if (codeMirrorName) await CodeMirrorMode(codeMirrorName);

        return {
            name: 'axtell',
            sourceLanguage: language.cmName // If this is null then will still work
        };
    })
);
