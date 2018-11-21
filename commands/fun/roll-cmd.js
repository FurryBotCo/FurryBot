module.exports = (async (self,local) => {
	
	var min = typeof local.args[0] !== "undefined" ? parseInt(local.args[0]) : 1;
	var max = typeof local.args[1] !== "undefined" ? parseInt(local.args[1]) : 20;

	return local.message.reply(`you rolled a ${self._.random(min,max)}!`);
});