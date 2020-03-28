import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Colors, ChannelNames } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"inviteinfo",
		"invinfo"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const k = msg.unparsedArgs.join("").match(new RegExp("^((https?\:\/\/)?(discord\.gg|discordapp\.com\/invite)\/)?([A-Za-z0-9]{2,32})$", "i"));

	if (!k || k.length === 0) return msg.reply("{lang:commands.utility.inviteinfo.noInv}");
	const code = k[4];

	if (!code) return msg.reply("{lang:commands.utility.inviteinfo.noInv}");

	const inv = (await this.getInvite(code, true).catch(err => null)) as Eris.Invite & { channel: { type: number; }; guild: { vanityUrlCode?: string; }; };
	if (!inv) return msg.reply("{lang:commands.utility.inviteinfo.invalid}");
	const { guild, inviter, channel } = inv;

	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setTitle("{lang:commands.utility.inviteinfo.title}")
		.setColor(Colors.green)
		.setAuthor(guild.name, !guild.icon ? "https://i.furcdn.net/noicon.png" : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`)
		.addField("{lang:commands.utility.inviteinfo.info}", [
			"**{lang:commands.utility.inviteinfo.extra}**:",
			`\u25FD {lang:commands.utility.inviteinfo.code}: [${inv.code}](https://discord.gg/${inv.code})`,
			"",
			"**{lang:commands.utility.inviteinfo.server}**:",
			`\u25FD {lang:commands.utility.inviteinfo.serverName}: [${guild.name}](https://discord.gg/${inv.code})`,
			`\u25FD {lang:commands.utility.inviteinfo.serverId}: ${guild.id}`,
			`\u25FD {lang:commands.utility.inviteinfo.memberCount}: ${inv.memberCount || "{lang:commands.utility.inviteinfo.unknown}"}`,
			`\u25FD {lang:commands.utility.inviteinfo.presenceCount}: ${inv.presenceCount || "{lang:commands.utility.inviteinfo.unknown}"}`,
			`\u25FD {lang:commands.utility.inviteinfo.vanityURLCode}: ${inv.guild.vanityUrlCode || "{lang:commands.utility.inviteinfo.none}"}`,
			"",
			"**{lang:commands.utility.inviteinfo.channel}**:",
			`\u25FD {lang:commands.utility.inviteinfo.channelName}: ${channel.name}`,
			`\u25FD {lang:commands.utility.inviteinfo.channelId: ${channel.id}`,
			`\u25FD {lang:commands.utility.inviteinfo.channelType}: ${ChannelNames[channel.type]}`
		].join("\n"), false);

	if (!!inviter) {
		embed.addField(
			"{lang:commands.utility.inviteinfo.inviter}",
			[
				`{lang:commands.utility.inviteinfo.name}: ${inviter.username}#${inviter.discriminator}`,
				`{lang:commands.utility.inviteinfo.id}: ${inviter.id}`,
				`{lang:commands.utility.inviteinfo.bot}: ${inviter.bot ? "{lang:commands.utility.inviteinfo.yes}" : "{lang:commands.utility.inviteinfo.no}"}`,
				`{lang:commands.utility.inviteinfo.system}: ${inviter.system ? "{lang:commands.utility.inviteinfo.yes}" : "{lang:commands.utility.inviteinfo.no}"}`
			].join("\n"),
			false);
		embed.setThumbnail(inviter.avatarURL);
	}
	return msg.channel.createMessage({
		embed
	});
}));
