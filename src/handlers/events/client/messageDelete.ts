import { ClientEvent, PartialMessage } from "bot-stuff";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import { mdb } from "../../../modules/Database";
import GuildConfig from "../../../modules/config/GuildConfig";
import { channelType } from "../../../util/Constants.json";

export default new ClientEvent<FurryBot>("messageDelete", (async function (this: FurryBot, message: Eris.Message) {
	if (!this || !message || !message.author || message.author.bot || ![channelType.GUILD_NEWS, channelType.GUILD_STORE, channelType.GUILD_TEXT].includes(message.channel.type)) return;
	const g = await mdb.collection("guilds").findOne({ id: (message.channel as Eris.TextChannel).guild.id }).then(res => new GuildConfig((message.channel as Eris.TextChannel).guild.id, res));
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
