module.exports = (async function(info) {
	if(this.logger !== undefined) return this.logger.warn(info);
	else return console.warn(info);
});