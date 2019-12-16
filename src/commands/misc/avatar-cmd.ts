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
		"avatar"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks",
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Get a users avatar.",
	usage: "[@user]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let user: Eris.User;
	if (msg.args.length < 1) user = msg.author;
	else user = await msg.getUserFromArgs();
	if (!user) return msg.errorEmbed("INVALID_USER");

	let color;
	if (msg.channel.guild.members.has(user.id)) {
		const member = msg.channel.guild.members.get(user.id);
		const role = msg.channel.guild.roles.get(member.roles[member.roles.length]);
		if (role.color) color = role.color;
	}
	if (!color) color = this.f.randomColor();

	const embed: Eris.EmbedOptions = {
		title: "Avatar",
		image: {
			url: user.avatarURL
		},
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		},
		footer: {
			text: `${user.username}#${user.discriminator}`,
			icon_url: user.avatarURL
		},
		description: `[Link](${user.avatarURL})`,
		color
	};

	return msg.channel.createMessage({ embed });
}));
