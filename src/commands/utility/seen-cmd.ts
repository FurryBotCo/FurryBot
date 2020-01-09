import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"seen",
		"seenon"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get the servers I share with a user.",
	usage: "<@member/id>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	const a = this.guilds.filter(g => g.members.has(user.id)),
		b = a.map(g => `${g.name} (${g.id})`),
		guilds = [],
		fields = [];

	let i = 0;

	for (const key in b) {
		if (!guilds[i]) guilds[i] = "";
		if (guilds[i].length > 1000 || +guilds[i].length + b[key].length > 1000) {
			i++;
			guilds[i] = b[key];
		} else {
			guilds[i] += `\n${b[key]}`;
		}
	}

	guilds.forEach((g, c) =>
		fields.push({
			name: `Server List #${+c + 1}`,
			value: g,
			inline: false
		})
	);

	const embed: Eris.EmbedOptions = {
		title: `Seen On ${b.length} Servers - ${user.user.username}#${user.user.discriminator} (${user.id})`,
		description: `I see this user in ${a.length} other servers.`,
		fields,
		timestamp: new Date().toISOString()
	};

	if (a.length > 30) {
		embed.fields = [];
		embed.description += "\nNot showing names/ids, user has too many in common (>30).";
	}

	msg.channel.createMessage({ embed });
}));
