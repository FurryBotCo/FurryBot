import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import Eris from "eris";
import db from "../modules/Database";

export default new ClientEvent("messageUpdate", (async function (this: FurryBot, message: Eris.Message<Eris.GuildTextableChannel>, oldMessage: Eris.OldMessage) {
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

	if (!g.logEvents) return;
	const e = g.logEvents.find(l => l.type === "messageEdit");
	if (!e || !e.channel) return;
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = await this.getRESTChannel<Eris.GuildTextableChannel>(e.channel);
	if (!ch) return g.mongoEdit({ $pull: e });

	if (!ch || ch.guild.id !== message.guildID) return;

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
