import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import Permissions from "../../util/Permissions";

export default new Command({
	triggers: [
		"invite",
		"inv",
		"discord"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get some invite links for me!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const botPerms = config.bot.permissions.map(perm => Permissions.constant[perm] || 0).reduce((a, b) => a + b, 0);

	const embed: Eris.EmbedOptions = {
		title: "Discord",
		description: `[Join Our Discord Server!](${config.bot.supportInvite})\n[Invite Me To Your Server](https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=${botPerms})`,
		thumbnail: {
			url: "https://cdn.discordapp.com/embed/avatars/0.png"
		},
		color: Math.floor(Math.random() * 0xFFFFFF),
		timestamp: new Date().toISOString(),
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		}
	};

	return msg.channel.createMessage({ embed });
}));
