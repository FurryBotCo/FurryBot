import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";
import { ChannelNamesCamelCase } from "../util/Constants";

export default new ClientEvent("messageDeleteBulk", (async function (this: FurryBot, messages: Eris.PossiblyUncachedMessage[]) {
	this.increment([
		"events.messageDeleteBulk"
	], [`channelType: ${ChannelNamesCamelCase[messages[0].channel.type]}`]);
}));
