module.exports = (async (self,local) => {
	Object.assign(self,local);
	
	return self.message.reply(`Your balance is ${self.uConfig.bal}.`);
});