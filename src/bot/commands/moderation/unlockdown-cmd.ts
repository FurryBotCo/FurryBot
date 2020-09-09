import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import * as fs from "fs-extra";
import Eris from "eris";

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

		if (!d[msg.channel.guild.id] || !d[msg.channel.guild.id].channels || !d[msg.channel.guild.id].lockdown) return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notDone`));
		let i = 0;
		const h = msg.channel.guild.channels.filter(c => [Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(c.type as any));
		for (const c of h) {
			const v = d[msg.channel.guild.id].channels[c.id];
			if (!v) continue;
			i++;
			await c.editPermission(msg.channel.guild.id, v.allow, v.deny, "role", `Unlockdown: ${msg.author.tag}`);
		}

		delete d[msg.channel.guild.id];
		fs.writeFileSync(f, JSON.stringify(d));
		await this.m.createUnlockdownEntry(msg.channel, msg.gConfig, msg.author);

		await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.finished`, [i]));
	});
