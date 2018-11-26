exports.regexRatio = (string, regex) => (string.match(regex) || []).reduce((a, b) => a + b.length, 0) / string.length;
