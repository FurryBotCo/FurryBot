import Command from "../../util/CommandHandler/lib/Command";
import config from "../../config";
import Eris from "eris";
import { Colors } from "../../util/Constants";
import db from "../../modules/Database";

export default new Command({
	triggers: [
		"rank"
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
	let user: Eris.User;
	if (msg.args.length < 1) user = msg.author;
	else user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");
	const c = await db.getUser(user.id);

	const lvl = config.leveling.calcLevel(c.getLevel(msg.channel.guild.id));
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
