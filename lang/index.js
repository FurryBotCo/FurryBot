module.exports = ((client)=>{
	var resp = {};
	client.config.languages.forEach((lang)=>{
		resp[lang] = require(`${process.cwd()}/lang/responses-${lang}`);
	});
	return resp;
});