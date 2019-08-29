import ClientEvent from "../../../modules/ClientEvent";
import PartialMessage from "../../../modules/PartialMessage";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";

export default new ClientEvent("messageUpdate", (async function (this: FurryBot, message: Eris.Message, oldMessage: PartialMessage) {
	if (!this || !message || !message.author || message.author.bot || !oldMessage || message.channel.type !== 0 || message.content === oldMessage.content) return;

	this.emit("messageCreate", message);
}));