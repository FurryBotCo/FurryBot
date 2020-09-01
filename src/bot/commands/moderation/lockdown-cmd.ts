import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import * as fs from "fs-extra";
import Eris from "eris";

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
	.setExecutor(async function (msg, cmd) {
		const f = `${__dirname}/../../config/other/lockdown.json`;
		const d: {
			[k: string]: {
				lockdown: boolean;
				channels: {
					[k: string]: {
						allow: number;
						deny: number;
					};
				};
			};
		} = JSON.parse(fs.readFileSync(f).toString());

		if (d[msg.channel.guild.id]) {
			if (d[msg.channel.guild.id].lockdown) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyDone`));
			delete d[msg.channel.guild.id];
		}
		d[msg.channel.guild.id] = {
			lockdown: true,
			channels: {}
		};

		const h = msg.channel.guild.channels.filter(c => [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type as any));
		for (const c of h) {
			const p: Eris.PermissionOverwrite = c.permissionOverwrites.find(o => o.type === "role" && o.id === msg.channel.guild.id) || {
				allow: 0,
				deny: 0
			} as any;
			if ([Eris.Constants.Permissions.sendMessages].some(v => p.deny & v)) continue; // skip if send is already denied
			else {
				d[msg.channel.guild.id].channels[c.id] = {
					allow: p.allow,
					deny: p.deny
				};
				if (p.allow & Eris.Constants.Permissions.sendMessages) p.allow -= Eris.Constants.Permissions.sendMessages;
				await c.editPermission(msg.channel.guild.id, p.allow, p.deny + Eris.Constants.Permissions.sendMessages, "role", `Lockdown: ${msg.author.tag}`);
			}
		}

		fs.writeFileSync(f, JSON.stringify(d));

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.finished`, [Object.keys(d[msg.channel.guild.id].channels).length]));
	});
