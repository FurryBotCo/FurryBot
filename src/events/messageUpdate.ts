import ClientEvent from "../util/ClientEvent";
import PartialMessage from "../modules/PartialMessage";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";

export default new ClientEvent("messageUpdate", (async function (this: FurryBot, message: Eris.Message<Eris.GuildTextableChannel>, oldMessage: PartialMessage) {
	this.track("events", "messageUpdate");
	if (!this || !message || !message.author || message.author.bot || !oldMessage || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any) || message.content === oldMessage.content) return;
	const g = await db.getGuild(message.channel.guild.id);
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
	if (!e || e.enabled || !e.channel) return;
	const ch = await this.getRESTChannel<Eris.GuildTextableChannel>(e.channel);

	if (ch.guild.id !== message.guildID) {
		this.log("warn", `messageUpdate log attempted in a guild that was not the same as the one the event came from. (${ch.guild.id}/${message.guildID})`, "Message Update");
		await g.edit({
			logEvents: {
				messageEdit: null
			}
		});
		return;
	}

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

	return ch.createMessage({ embed }).catch(err => null);
}));
