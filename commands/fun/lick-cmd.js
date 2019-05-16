module.exports = {
	triggers: [
		"lick"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Lick someone... owo",
	usage: "<@user or text>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let input, text, attachment, img;
		input = message.args.join(" ");
		text = this.varParse(message.c,{author:message.author,input:input});
		if(message.gConfig.commandImages) {
			if(!message.channel.permissionsOf(this.bot.user.id).has("attachFiles") /* 32768 */) return message.channel.createMessage("Hey, I require the `ATTACH_FILES` permission for images to work on these commands!");
			img = await this.imageAPIRequest(false,"lick",true,true);
			if(!img.success) return message.channel.createMessage(`<@!${message.author.id}>, Image API returned an error: ${img.error.description}`);
			message.channel.createMessage(text,{
				file: await this.getImageFromURL(img.response.image),
				name: img.response.name
			});
		} else {
			message.channel.createMessage(text);
		}
	})
};