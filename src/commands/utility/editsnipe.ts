import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";

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
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (!msg.gConfig.settings.snipeCommand) return msg.reply("this command has been disabled in this servers settings.");
	let ch: Eris.TextChannel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs();

	if (!ch) ch = msg.channel;

	const s = msg.gConfig.snipe.edit[ch.id];

	if (!s) return msg.reply(`no edit snipes found for the channel <#${ch.id}>.`);
	const i = s.content.match(new RegExp("((https?:\/\/)?(discord(app\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
	const iN = s.oldContent.match(new RegExp("((https?:\/\/)?(discord(app\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
	if (!!i) i.map(k => s.content = s.content.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
	if (!!iN) iN.map(k => s.oldContent = s.oldContent.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));

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
