import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";

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
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// await msg.channel.startTyping();
	let user: Eris.User;
	if (msg.args.length < 1) user = msg.author;
	else user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	let color;
	if (msg.channel.guild.members.has(user.id)) {
		const member = msg.channel.guild.members.get(user.id);
		const r = member.roles.map(r => msg.channel.guild.roles.get(r)).filter(r => !!r && r.color !== 0);
		const role = r[r.length - 1];
		if (role && role.color) color = role.color;
	}

	if ([undefined, null].includes(color)) color = Math.floor(Math.random() * 0xFFFFFF);

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
			icon_url: `${msg.author.avatarURL.split("?")[0]}?size=1024`
		},
		description: `[Link](${msg.author.avatarURL.split("?")[0]}?size=1024)`,
		color
	};

	return msg.channel.createMessage({ embed });
}));
