module.exports = {
	triggers: [
		"updates"
	],
	userPermissions: [],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 1.5e3,
	description: "Toggle your update notifications",
	usage: "",
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
		let role = this.bot.guilds.get(this.config.bot.mainGuild).roles.find(r => r.name.toLowerCase() === "announcement notified");
		if(!role) return message.channel.createMessage(`<@!${message.author.id}>, Announcement Notified role was not found, please notify an admin.`);
		if(message.member.roles.includes(role.id)) {
			return message.member.removeRole(role.id).then(() => {
				return message.channel.createMessage(`<@!${message.author.id}>, I've unsubscibed you from announcements, run this again to resume notifications.`);
			}).catch((err) => {
				return message.channel.createMessage(`<@!${message.author.id}>, Role removal failed: ${err}`);
			});
		} else {
			return message.member.addRole(role.id).then(() => {
				return message.channel.createMessage(`<@!${message.author.id}>, I've subscibed you to announcements, run this again to stop notifications.`);
			}).catch((err) => {
				return message.channel.createMessage(`<@!${message.author.id}>, Role addition failed: ${err}`);
			});
		}
	})
};