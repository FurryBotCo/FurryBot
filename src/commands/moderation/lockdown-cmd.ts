import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Redis } from "../../db";
import { Command } from "core";
import Eris from "eris";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["lockdown"], __filename)
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
		const v = await Redis.get(`lockdown:${msg.channel.guild.id}`);

		if (v) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyDone`));
		const ch: {
			[k: string]: {
				allow: string;
				deny: string;
			};
		} = {
		};

		const h = msg.channel.guild.channels.filter(c => [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type as 0 | 5));
		for (const c of h) {
			const p: Eris.PermissionOverwrite = c.permissionOverwrites.find(o => o.type === "role" && o.id === msg.channel.guild.id) || new Eris.PermissionOverwrite({
				allow: 0n,
				deny: 0n,
				id: "000000000000000000",
				type: "member"
			});
			if ([Eris.Constants.Permissions.sendMessages].some(j => p.deny & j)) continue; // skip if send is already denied
			else {
				ch[c.id] = {
					allow: String(p.allow),
					deny: String(p.deny)
				};
				if (p.allow & Eris.Constants.Permissions.sendMessages) p.allow -= Eris.Constants.Permissions.sendMessages;
				await c.editPermission(msg.channel.guild.id, p.allow, p.deny | Eris.Constants.Permissions.sendMessages, "role", encodeURIComponent(`Lockdown: ${msg.author.tag} (${msg.author.id})`));
			}
		}

		await Redis.set(`lockdown:${msg.channel.guild.id}`, JSON.stringify(ch));

		await this.executeModCommand("lockdown", {
			blame: msg.author.id,
			channel: msg.channel.id,
			target: null,
			reason: null
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.finished`, [Object.keys(ch).length]));
	});
