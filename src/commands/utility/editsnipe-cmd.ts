import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import { Internal } from "../../util/Functions";
import { Redis } from "../../modules/External";
import config from "../../config";

export default new Command({
	triggers: [
		"editsnipe",
		"es"
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

	let oldContent = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:oldContent`);
	let newContent = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:newContent`);
	const author = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:author`);
	const time = await Internal.fetchRedisKey(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:time`);

	if (!oldContent || !newContent || !author || !time) return msg.reply(`{lang:commands.utility.editsnipe.noSnipes|${ch.id}}`);
	const i = newContent.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
	const iN = oldContent.match(new RegExp("((https?:\/\/)?(discord((app)?\.com\/invite|\.gg))\/[a-zA-Z0-9]{1,10})", "gi"));
	if (i) i.map(k => newContent = newContent.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));
	if (iN) iN.map(k => oldContent = oldContent.replace(new RegExp(k, "gi"), `[\[INVITE\]](${k})`));

	const u = await this.bot.getRESTUser(author);

	await Redis.DEL(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:oldContent`);
	await Redis.DEL(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:newContent`);
	await Redis.DEL(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:author`);
	await Redis.DEL(`${config.beta ? "beta" : "prod"}:snipe:edit:${msg.channel.id}:time`);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.utility.editsnipe.title}")
			.setDescription(`{lang:commands.utility.editsnipe.old}: ${oldContent}\n{lang:commands.utility.editsnipe.new}: ${newContent}`)
			.setAuthor(`${u.username}#${u.discriminator}`, u.avatarURL)
			.setTimestamp(new Date(Number(time)).toISOString())
			.setColor(Colors.gold)
			.toJSON()
	});
}));
