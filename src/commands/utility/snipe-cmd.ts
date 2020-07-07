import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import { Internal } from "../../util/Functions";
import { Redis } from "../../modules/External";
import config from "../../config";

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

	let content = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:snipe:delete:${msg.channel.id}:content`);
	const author = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:snipe:delete:${msg.channel.id}:author`);
	const time = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:snipe:delete:${msg.channel.id}:time`);

	if (!content || !author || !time) return msg.reply(`{lang:commands.utility.snipe.noSnipes|${ch.id}}`);

	const i = content.match(new RegExp("((https?:\/\/)?(discord(app\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
	if (!!i) i.map(k => content = content.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
	const u = await this.bot.getRESTUser(author);


	await Redis.DEL(`${config.beta ? "beta" : "prod"}:snipe:delete:${msg.channel.id}:content`);
	await Redis.DEL(`${config.beta ? "beta" : "prod"}:snipe:delete:${msg.channel.id}:author`);
	await Redis.DEL(`${config.beta ? "beta" : "prod"}:snipe:delete:${msg.channel.id}:time`);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.utility.snipe.title}")
			.setAuthor(`${u.username}#${u.discriminator}`, `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`)
			.setDescription(content)
			.setTimestamp(new Date(Number(time)).toISOString())
			.setColor(Colors.red)
			.toJSON()
	});
}));
