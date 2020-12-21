import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import * as fs from "fs-extra";
import Eris from "eris";
import config from "../../config";
import Redis from "../../util/Redis";

export default new Command(["lockdown"], __filename)
	.setBotPermissions([
		"kickMembers",
		"manageGuild"
	])
	.setUserPermissions([
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const v = await Redis.get(`lockdown:${msg.channel.guild.id}`);

		if (v) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyDone`));
		const ch: {
			[k: string]: {
				allow: number;
				deny: number;
			};
		} = {
		};

		const h = msg.channel.guild.channels.filter(c => [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type as any));
		for (const c of h) {
			const p: Eris.PermissionOverwrite = c.permissionOverwrites.find(o => o.type === "role" && o.id === msg.channel.guild.id) || {
				allow: 0,
				deny: 0
			} as any;
			if ([Eris.Constants.Permissions.sendMessages].some(v => p.deny & v)) continue; // skip if send is already denied
			else {
				ch[c.id] = {
					allow: p.allow,
					deny: p.deny
				};
				if (p.allow & Eris.Constants.Permissions.sendMessages) p.allow -= Eris.Constants.Permissions.sendMessages;
				await c.editPermission(msg.channel.guild.id, p.allow, p.deny + Eris.Constants.Permissions.sendMessages, "role", encodeURIComponent(`Lockdown: ${msg.author.tag} (${msg.author.id})`));
			}
		}

		await Redis.set(`lockdown:${msg.channel.guild.id}`, JSON.stringify(ch));

		await this.m.createLockdownEntry(msg.channel, msg.gConfig, msg.author);

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.finished`, [Object.keys(ch).length]));
	});
