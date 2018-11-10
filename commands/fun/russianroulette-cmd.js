module.exports = (async (self,local) => {
	Object.assign(self,local);
	var val = Math.floor(Math.random()*6);
	var bullets = typeof self.args[0] !== "undefined" ? parseInt(self.args[0]) : 3;
	
	if(val<=bullets-1) {
		return self.message.reply("You died!");
	} else {
		return self.message.reply("You lived!");
	}
});