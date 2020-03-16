import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { db } from "../../modules/Database";
import config from "../../config";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"rank"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Get a users rank.",
	usage: "[@user]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// await msg.channel.startTyping();
	let user: Eris.User;
	if (msg.args.length < 1) user = msg.author;
	else user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	/*const users = await Promise.all(msg.channel.guild.members.map(async (m) => db.getUser(m.id))).then(m => m.sort((a, b) => b.getLevel(msg.channel.guild.id) - a.getLevel(msg.channel.guild.id)));

	const u = users.map((v, i) => ({ v, i })).filter(m => m.v.id === user.id).map(k => ({ ...k, l: k.v.getLevel(msg.channel.guild.id) }))[0];*/

	const lvl = config.leveling.calcLevel(msg.uConfig.getLevel(msg.channel.guild.id)/*u.l*/);
	const n = config.leveling.calcExp(lvl.level + 1);
	return msg.channel.createMessage({
		embed: {
			title: `${user.username}#${user.discriminator}'s Rank`,
			author: {
				name: `${user.username}#${user.discriminator}`,
				icon_url: user.avatarURL
			},
			description: [
				`Level: ${lvl.level}`,
				`XP: ${lvl.leftover}/${n.lvl} (${lvl.total} total)`/*,
				`Position: ${u.i + 1}/${users.length}`*/
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Colors.gold
		}
	});
}));
