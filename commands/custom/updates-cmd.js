module.exports = {
	triggers: [
		"updates"
	],
	userPermissions: [],
	botPermissions: [
		"MANAGE_ROLES"
	],
	cooldown: 1.5e3,
	description: "Toggle your update notifications",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let role = message.client.guilds.get(message.client.config.bot.mainGuild).roles.find(r=>r.name.toLowerCase()==="announcement notified");
		if(!role) return message.reply("Announcement Notified role was not found, please notify an admin.");
		if(message.member.roles.has(role.id)) {
			return message.member.roles.remove(role.id).then(() => {
				return message.reply("I've unsubscibed you from announcements, run this again to resume notifications.");
			}).catch((err) => {
				return message.reply(`Role removal failed: ${err}`);
			});
		} else {
			return message.member.roles.add(role.id).then(() => {
				return message.reply("I've subscibed you to announcements, run this again to stop notifications.");
			}).catch((err) => {
				return message.reply(`Role addition failed: ${err}`);
			});
		}
	})
};