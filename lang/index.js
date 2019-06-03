const config = require("../config");

module.exports = ((client) => {
	var resp = {};
	config.languages.forEach((lang) => {
		resp[lang] = require(`${process.cwd()}/lang/responses-${lang}`);
	});
	return resp;
});