import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import Eris from "eris";
import db from "../modules/Database";
import config from "../config";
import messageCreate from "./messageCreate";
import Redis from "../modules/External/Redis";

export default new ClientEvent("messageUpdate", (async function (this: FurryBot, message: Eris.Message<Eris.GuildTextableChannel>, oldMessage: Eris.OldMessage) {
	this.track("events", "messageUpdate");
	if (!this || !message || !message.author || message.author.bot || !oldMessage || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any) || message.content === oldMessage.content) return;

	if (config.beta && !config.client.betaEventGuilds.includes(message.channel.guild.id)) return;

	const g = await db.getGuild(message.channel.guild.id);
	// tslint:disable-next-line: no-string-literal
	if (typeof g["snipe"] !== "undefined") await g.mongoEdit({
		$unset: {
			snipe: 1
		}
	});

	// auto delete after 30 minutes
	await Redis.SETEX(`prod:snipe:edit:${message.channel.guild.id}:oldContent`, 1800, oldMessage.content);
	await Redis.SETEX(`prod:snipe:edit:${message.channel.guild.id}:newContent`, 1800, message.content);
	await Redis.SETEX(`prod:snipe:edit:${message.channel.guild.id}:author`, 1800, message.author.id);

	await messageCreate.listener.call(this, message, true);

	if (!g.logEvents) return;
	const e = g.logEvents.find(l => l.type === "messageEdit");
	if (!e || !e.channel) return;
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = await this.bot.getRESTChannel<Eris.GuildTextableChannel>(e.channel);
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
