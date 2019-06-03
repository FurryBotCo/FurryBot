const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

module.exports = {
	triggers: [
		"kick",
		"k"
	],
	userPermissions: [
		"kickMembers" // 2
	],
	botPermissions: [
		"kickMembers" // 2
	],
	cooldown: 2e3,
	description: "Kick members from your server",
	usage: "<@member/id> [reason]",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let user, reason, m, a;
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
    
		if(user.id === message.member.id && !message.user.isDeveloper) return message.channel.createMessage(`<@!${message.author.id}>, Pretty sure you don't want to do this to yourself.`);
		a = this.compareMembers(user,message.member);
		if((a.member2.higher || a.member2.same) && message.author.id !== message.channel.guild.ownerID) return message.channel.createMessage(`<@!${message.author.id}>, You cannot kick ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
		//if(!user.kickable) return message.channel.createMessage(`I cannot kick ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have kick permissions?`);
		reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
		if(!user.user.bot) m = await user.user.getDMChannel().then(dm => dm.createMessage(`You were kicked from **${message.channel.guild.name}**\nReason: ${reason}`));
		user.kick(`Kick: ${message.author.username}#${message.author.discriminator} -> ${reason}`).then(() => {
			message.channel.createMessage(`***User ${user.username}#${user.discriminator} was kicked, ${reason}***`).catch(noerr => null);
		}).catch(async(err) => {
			await message.channel.createMessage(`<@!${message.author.id}>, I couldn't kick **${user.username}#${user.discriminator}**, ${err}`);
			if(m !== undefined) {
				await m.delete();
			}
		});
    
		if(!message.gConfig.deleteCommands && message.channel.permissionsOf(this.bot.user.id).has("manageMessages")) message.delete().catch(error => null);
	})
};