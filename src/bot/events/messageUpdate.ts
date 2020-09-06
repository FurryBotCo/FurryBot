import Eris from "eris";
import config from "../../config";
import ClientEvent from "../../util/ClientEvent";
import Redis from "../../util/Redis";

export default new ClientEvent("messageUpdate", async function (message, oldMessage) {
	if (!this || !message || !message.author || message.author.bot || !oldMessage || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any) || message.content === oldMessage.content || (config.beta && !config.developers.includes(message.author.id))) return;

	// auto delete after 30 minutes
	await Redis.setex(`snipe:edit:${message.channel.id}:oldContent`, 1800, oldMessage.content);
	await Redis.setex(`snipe:edit:${message.channel.id}:newContent`, 1800, message.content);
	await Redis.setex(`snipe:edit:${message.channel.id}:author`, 1800, message.author.id);
	await Redis.setex(`snipe:edit:${message.channel.id}:time`, 1800, Date.now().toString());

	this.bot.emit("messageCreate", message, true);
});
