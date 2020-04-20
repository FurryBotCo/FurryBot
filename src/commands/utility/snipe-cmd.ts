import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"snipe"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (!gConfig.settings.snipeCommand) return msg.reply("{lang:other.error.commandDisabledSettings}");
	let ch: Eris.TextChannel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs();

	if (!ch) ch = msg.channel;

	const s = gConfig.snipe.delete[ch.id];

	if (!s) return msg.reply(`{lang:commands.utility.snipe.noSnipes|${ch.id}}`);

	const i = s.content.match(new RegExp("((https?:\/\/)?(discord(app\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
	if (!!i) i.map(k => s.content = s.content.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
	const u = await this.getRESTUser(s.authorId);

	await gConfig.edit({ snipe: { delete: { [ch.id]: null } } }).then(d => d.reload());
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.utility.snipe.title}")
			.setAuthor(`${u.username}#${u.discriminator}`, `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`)
			.setDescription(s.content)
			.setTimestamp(new Date(s.time).toISOString())
			.setColor(Colors.red)
	});
}));
