import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";
import phin from "phin";
import Permissions from "../../util/Permissions";

export default new Command({
	triggers: [
		"perms",
		"listperms"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const allowUser = [],
		denyUser = [],
		allowBot = [],
		denyBot = [],
		b = msg.channel.permissionsOf(this.user.id),
		remove = ["all", "allGuild", "allText", "allVoice"];

	for (const p in Permissions.constant) {
		if (remove.includes(p)) continue;
		if (msg.member.permission.allow & Permissions.constant[p]) allowUser.push(p);
		else denyUser.push(p);
	}

	for (const p in Permissions.constant) {
		if (remove.includes(p)) continue;
		if (b.allow & Permissions.constant[p]) allowBot.push(p);
		else denyBot.push(p);
	}

	const au = allowUser.length === 0 ? "NONE" : allowUser.join("**, **");
	const du = denyUser.length === Object.keys(Permissions.constant).length ? "NONE" : denyUser.join("**, **");
	const ab = allowBot.length === 0 ? "NONE" : allowBot.join("**, **");
	const db = denyBot.length === Object.keys(Permissions.constant).length ? "NONE" : denyBot.join("**, **");


	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.information.perms.title}")
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.green)
			.addField("{lang:commands.information.perms.user}", `__Allow__:\n**${au.length === 0 ? "NONE" : au}**\n\n\n__Deny__:\n**${du.length === 0 ? "NONE" : du}**`)
			.addField("{lang:commands.information.perms.bot}", `__Allow__:\n**${ab.length === 0 ? "NONE" : ab}**\n\n\n__Deny__:\n**${db.length === 0 ? "NONE" : db}**`)
	});
}));
