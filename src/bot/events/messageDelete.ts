import Eris from "eris";
import ClientEvent from "../../util/ClientEvent";
import Redis from "../../util/Redis";

export default new ClientEvent("messageDelete", async function (message: Eris.Message) {
	if (!this || !message || !message.author || message.author.bot || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any)) return;

	// auto delete after 30 minutes
	await Redis.setex(`snipe:delete:${message.channel.id}:content`, 1800, message.content);
	await Redis.setex(`snipe:delete:${message.channel.id}:author`, 1800, message.author.id);
	await Redis.setex(`snipe:delete:${message.channel.id}:time`, 1800, Date.now().toString());
});
