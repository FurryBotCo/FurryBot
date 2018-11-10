module.exports = (async (self,local) => {
	Object.assign(self,local);
	var min = typeof self.args[0] !== "undefined" ? parseInt(self.args[0]) : 1;
	var max = typeof self.args[1] !== "undefined" ? parseInt(self.args[1]) : 20;

	return self.message.reply(`you rolled a ${self._.random(min,max)}!`);
});