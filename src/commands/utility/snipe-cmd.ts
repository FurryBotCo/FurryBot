import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";

export default new Command({
	triggers: [
		"snipe"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let ch: Eris.TextChannel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs();

	if (!ch) ch = msg.channel;

	const s = gConfig.snipe.delete[ch.id];

	if (!s) return msg.reply(`{lang:commands.utility.snipe.noSnipes|${ch.id}}`);

	const i = s.content.match(new RegExp("((https?:\/\/)?(discord(app\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
	if (!!i) i.map(k => s.content = s.content.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
	const u = await this.bot.getRESTUser(s.authorId);

	await gConfig.edit({ snipe: { delete: { [ch.id]: null } } }).then(d => d.reload());
	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.utility.snipe.title}")
			.setAuthor(`${u.username}#${u.discriminator}`, `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`)
			.setDescription(s.content)
			.setTimestamp(new Date(s.time).toISOString())
			.setColor(Colors.red)
			.toJSON()
	});
}));
