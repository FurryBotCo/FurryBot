import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import * as fs from "fs-extra";
import Eris from "eris";
import config from "../../config";
import Redis from "../../util/Redis";

export default new Command(["unlockdown"], __filename)
	.setBotPermissions([
		"kickMembers",
		"manageGuild"
	])
	.setUserPermissions([
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {

		const v = await Redis.get(`lockdown:${msg.channel.guild.id}`);

		if (!v) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notDone`));
		const ch: {
			[k: string]: {
				allow: number;
				deny: number;
			};
		} = JSON.parse(v);

		let i = 0;
		const h = msg.channel.guild.channels.filter(c => [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type as any));
		for (const c of h) {
			const v = ch[c.id];
			if (!v) continue;
			i++;
			await c.editPermission(msg.channel.guild.id, v.allow, v.deny, "role", encodeURIComponent(`Unlockdown: ${msg.author.tag} (${msg.author.id})`));
		}

		await this.m.createUnlockdownEntry(msg.channel, msg.gConfig, msg.author);
		await Redis.del(`lockdown:${msg.channel.guild.id}`);

		await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.finished`, [i]));
	});
