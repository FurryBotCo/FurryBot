module.exports = {
	triggers: [
		"furpile",
		"pileon",
		"pile"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Start a furpile on someone, or join in!",
	usage: "[@user]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) {
			if(message.channel.furpile !== undefined && message.channel.furpile.active) {
				if(message.channel.furpile.inPile.includes(message.author.id) && !message.user.isDeveloper) return message.channel.createMessage(`<@!${message.author.id}>, you are already in this furpile!`);
				clearTimeout(message.channel.furpile.timeout);
				message.channel.furpile.inPile.push(message.author.id);
				message.channel.createMessage(`<@!${message.author.id}> joined a furpile on <@!${message.channel.furpile.member.id}>!\n<@!${message.channel.furpile.member.id}> now has ${message.channel.furpile.inPile.length} furs on them!\nJoin in using \`${message.gConfig.prefix}furpile\`.`);
				message.channel.furpile.timeout = setTimeout((ch) => {
					delete ch.furpile;
				},6e4,message.channel);
				return;
			}
			else return new Error("ERR_INVALID_USAGE");
		} else {
			const member = await message.getMemberFromArgs();
			if(!member) return message.errorEmbed("INVALID_USER");
			await message.channel.createMessage(`<@!${message.author.id}> started a furpile on <@!${member.id}>!\nJoin in using \`${message.gConfig.prefix}furpile\`.`);
			message.channel.furpile = {
				active: true,
				member,
				inPile: [],
				timeout: setTimeout((ch) => {
					delete ch.furpile;
				},6e4,message.channel)
			};
			return message.channel.furpile.inPile.push(message.author.id,member.id);
		}
	})
};