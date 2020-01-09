import ClientEvent from "../util/ClientEvent";
import PartialMessage from "../util/PartialMessage";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { ChannelNamesCamelCase } from "../util/Constants";

export default new ClientEvent("messageUpdate", (async function (this: FurryBot, message: Eris.Message, oldMessage: PartialMessage) {
	if (!this || !message || !message.author || message.author.bot || !oldMessage || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any) || message.content === oldMessage.content) return;
	this.increment([
		"events.messageUpdate"
	], [`channelType:${ChannelNamesCamelCase[message.channel.type]}`]);
	const g = await db.getGuild((message.channel as Eris.GuildChannel).guild.id);
	await g.edit({
		snipe: {
			edit: {
				[message.channel.id]: {
					content: message.content,
					oldContent: oldMessage.content,
					authorId: message.author.id,
					time: Date.now()
				}
			}
		}
	}).then(d => d.reload());
	this.emit("messageCreate", message);

	const e = g.logEvents.messageEdit;
	if (!e.enabled || !e.channel) return;
	const ch = await this.getRESTChannel(e.channel) as Eris.GuildTextableChannel;
	if (!ch || !["sendMessages", "embedLinks"].some(p => ch.permissionsOf(this.user.id).has(p))) return g.edit({
		logEvents: {
			messageEdit: {
				enabled: false,
				channel: null
			}
		}
	});

	const embed: Eris.EmbedOptions = {
		title: "Message Edited",
		author: {
			name: `${message.author.username}#${message.author.discriminator}`,
			icon_url: message.author.avatarURL
		},
		description: `Message by <@!${message.author.id}> edited in <#${message.channel.id}>`,
		timestamp: new Date().toISOString(),
		fields: [
			{
				name: "Old Content",
				value: oldMessage.content || "None",
				inline: false
			},
			{
				name: "New Content",
				value: message.content || "None",
				inline: false
			}
		]
	};

	return ch.createMessage({ embed });
}));
