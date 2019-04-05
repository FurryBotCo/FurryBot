module.exports = (async function(info) {
	if(this.config !== undefined && this.config.debug === true) {
		if(["Duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;
		if(this.logger !== undefined) return this.logger.debug(info);
		else return console.debug(info);
	}
});