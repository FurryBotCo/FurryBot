import ClientEvent from "../util/ClientEvent";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { ChannelNamesCamelCase } from "../util/Constants";

export default new ClientEvent("messageDelete", (async function (this: FurryBot, message: Eris.Message) {
	if (!this || !message || !message.author || message.author.bot || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any)) return;
	this.increment([
		"events.messageDelete"
	], [`channelType: ${ChannelNamesCamelCase[message.channel.type]}`]);
	const g = await db.getGuild((message.channel as Eris.GuildChannel).guild.id);
	await g.edit({
		snipe: {
			delete: {
				[message.channel.id]: {
					content: message.content,
					authorId: message.author.id,
					time: Date.now()
				}
			}
		}
	}).then(d => d.reload());
}));
