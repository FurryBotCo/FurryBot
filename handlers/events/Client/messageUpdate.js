module.exports = (async function(message,oldMessage) {
	if(!this || !this.mdb || message.author.bot || !message || !oldMessage || message.channel.type !== 0) return;
	this.bot.emit("messageCreate",message);
});