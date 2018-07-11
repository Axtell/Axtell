CodeMirror.defineMode("axtell-overlay", function(config, parserConfig) {
	return CodeMirror.overlayMode(
		CodeMirror.getMode(config, parserConfig.sourceLanguage), {
		token: function(stream, state) {
			let results;
			if (results = stream.match(/@@axtell:([a-z]+)@@/)) {
				let name = results[1];
				return `axtell-template-${name}`;
			}
			return null;
		}
	});
});
