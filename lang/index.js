module.exports = ((self)=>{
	var resp = {};
	self.config.languages.forEach((lang)=>{
		resp[lang] = require(`${process.cwd()}/lang/responses-${lang}`);
	});
	return resp;
});