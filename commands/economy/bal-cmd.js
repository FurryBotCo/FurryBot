module.exports = (async (self,local) => {
	local.channel.startTyping();
	local.message.reply(`Your balance is ${self.uConfig.bal}.`);
	return local.channel.stopTyping();
});