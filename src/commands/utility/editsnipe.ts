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
		"editsnipe",
		"es"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Get the last edited message in a channel.",
	usage: "[channel]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	let ch: Eris.TextChannel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs() as Eris.TextChannel;

	if (!ch) ch = msg.channel;

	const s = msg.gConfig.snipe.edit[ch.id];

	if (!s) return msg.reply(`no edit snipes found for the channel <#${ch.id}>.`);

	const u = await this.getRESTUser(s.authorId);
	const embed: Eris.EmbedOptions = {
		title: "Message Edit Snipe",
		author: {
			name: `${u.username}#${u.discriminator}`,
			icon_url: `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`
		},
		description: `Old Content: ${s.oldContent}\nNew Content: ${s.content}`,
		timestamp: new Date(s.time).toISOString()
	};

	await msg.gConfig.edit({ snipe: { edit: { [ch.id]: null } } }).then(d => d.reload());
	return msg.channel.createMessage({ embed });
}));
