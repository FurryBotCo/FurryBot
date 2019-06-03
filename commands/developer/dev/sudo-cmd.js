const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"sudo",
		"runas"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 0,
	description: "Force another user to run a comand (dev only)",
	usage: "<user> <command> [args]",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		// extra check, to be safe
		if (!config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		if(message.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
		let user, toRun, embed;
		// get user from message
		user = await message.getUserFromArgs();
    
		if(!user || !(user instanceof this.Eris.User)) {
			embed = {
				title: "User not found",
				description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
			};
			Object.assign(embed, message.embed_defaults());
			message.channel.createMessage({ embed });
		}
		toRun = [...message.unparsedArgs];
		toRun.shift();
		await this.runAs(toRun,user,message.channel);
		embed = {
			title: "Sudo Command",
			description: `Sent message event with "${toRun}" as ${user.username}#${user.discriminator}`
		};
		Object.assign(embed,message.embed_defaults());
		message.channel.createMessage({ embed });
	})
};