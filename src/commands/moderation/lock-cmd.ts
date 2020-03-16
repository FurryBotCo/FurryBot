import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"lock"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: ["manageChannels"],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Lock a channel to prevent people talking in it.",
	usage: "[channel]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let ch = msg.channel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs();
	if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
	const o = ch.permissionOverwrites.get(msg.channel.guild.id);
	if (![undefined, null].includes(o)) {
		if (o.allow & 2048) o.allow -= 2048;
		if (o.deny & 2048) return msg.reply(`the send messages permission seems to already be denied ${ch.id === msg.channel.id ? "in this" : "on that"}  channel.`);
	}

	await ch.editPermission(msg.channel.guild.id, o.allow, o.deny + 2048, "role");

	if (!!msg.gConfig.settings.modlog) {
		if (!msg.channel.guild.channels.has(msg.gConfig.settings.modlog)) await msg.reply(`failed to create mod log entry, as I could not find the mod log channel.`);
		else {
			const ch = msg.channel.guild.channels.get(msg.gConfig.settings.modlog) as Eris.GuildTextableChannel;
			if (!ch.permissionsOf(this.user.id).has("sendMessages")) await msg.reply(`failed to create mod log entry, as I cannot send messages in the mod log channel.`);
			else if (!ch.permissionsOf(this.user.id).has("embedLinks")) await msg.reply(`failed to create mod log entry, as I cannot send embeds in the mod log channel.`);
			else {
				await ch.createMessage({
					embed: {
						title: "Channel Locked",
						description: [
							`Target: ${ch.name} <#${ch.id}>`
						].join("\n"),
						timestamp: new Date().toISOString(),
						color: Colors.red,
						author: {
							name: msg.channel.guild.name,
							icon_url: msg.channel.guild.iconURL
						},
						footer: {
							text: `Action carried out by ${msg.author.tag}`
						}
					}
				});
			}
		}
	}

	return msg.reply(`lock executed.\nNote: This lock will not work if a user has the \`administrator\` permission, or if \`send messages\` is ticked to yes in the channels permission overrides.`);
}));
