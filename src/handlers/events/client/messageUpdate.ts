import { ClientEvent, PartialMessage } from "bot-stuff";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";

export default new ClientEvent<FurryBot>("messageUpdate", (async function (this: FurryBot, message: Eris.Message, oldMessage: PartialMessage) {
	if (!this || !message || !message.author || message.author.bot || !oldMessage || message.channel.type !== 0 || message.content === oldMessage.content) return;
	this.bot.emit("messageCreate", message);
}));
