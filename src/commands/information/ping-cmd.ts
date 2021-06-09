import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import db from "../../db";
const { mongo, r: Redis } = db;
import { Colors, Command, EmbedBuilder } from "core";
import Language from "language";
import { performance } from "perf_hooks";

export default new Command<FurryBot, UserConfig, GuildConfig>(["ping"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let create: number, edit: number, del: number;
		await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.calculating`))
			// eslint-disable-next-line no-sequences
			.then(m => (create = m.timestamp, m.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.calculated`))))
			.then(async (m) => {
				await msg.channel.sendTyping();
				const extra = msg.dashedArgs.value.includes("extra");
				edit = m.editedTimestamp!;
				await m.delete().then(() => del = Date.now());
				const e =  new EmbedBuilder(msg.gConfig.settings.lang)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setDescription([
						`{lang:${cmd.lang}.shardTime|${msg.channel.guild.shard.id}}: **${Math.abs(Math.floor(msg.channel.guild.shard.latency))}ms**`,
						`{lang:${cmd.lang}.msgTime}: **${Math.abs(Math.floor(edit - create))}ms**`
					].join("\n"))
					.setTimestamp(new Date().toISOString())
					.setFooter("OwO", this.client.user.avatarURL)
					.setColor(Colors.gold);
				if (extra && Redis !== null) {
					const dbStart = performance.now();
					await mongo.db("admin").command({
						ping: 1
					});
					const dbEnd = performance.now();

					const redisStart = performance.now();
					await Redis.ping();
					const redisEnd = performance.now();
					e.setDescription([
						e.getDescription(),
						`{lang:${cmd.lang}.dbPing}: **${Math.abs(dbStart - dbEnd).toFixed(3)}ms**`,
						`{lang:${cmd.lang}.redisPing}: **${Math.abs(redisStart - redisEnd).toFixed(3)}ms**`,
						`{lang:${cmd.lang}.generalTime}: **${Math.abs(Math.floor(create - msg.timestamp))}ms**`,
						`{lang:${cmd.lang}.deleteTime}: **${Math.abs(Math.floor(del - create))}ms**`
					].join("\n"));
				}
				return msg.channel.createMessage({
					embed: e.toJSON()
				});
			});
	});
