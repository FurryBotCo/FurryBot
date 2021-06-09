import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import db from "../../db";
const { r: Redis } = db;
import { Command } from "core";
import Language from "language";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["unlockdown"], __filename)
	.setBotPermissions([
		"manageChannels"
	])
	.setUserPermissions([
		"kickMembers",
		"manageGuild"
	])
	.setRestrictions([])
	.setCooldown(3e4, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) throw new TypeError("Redis is not ready.");
		const j = await Redis.get(`lockdown:${msg.channel.guild.id}`);

		if (!j) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notDone`));
		const ch = JSON.parse(j) as {
			[k: string]: {
				allow: string;
				deny: string;
			};
		};

		let i = 0;
		const h = msg.channel.guild.channels.filter(c => [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type as 0 | 5));
		for (const c of h) {
			const v = ch[c.id];
			if (!v) continue;
			i++;
			await c.editPermission(msg.channel.guild.id, BigInt(v.allow), BigInt(v.deny), "role", encodeURIComponent(`Unlockdown: ${msg.author.tag} (${msg.author.id})`));
		}

		await Redis.del(`lockdown:${msg.channel.guild.id}`);

		await this.executeModCommand("unlockdown", {
			blame: msg.author.id,
			channel: msg.channel.id,
			target: null,
			reason: null
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.finished`, [i]));
	});
