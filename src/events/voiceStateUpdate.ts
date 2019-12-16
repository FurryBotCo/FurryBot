import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("voiceStateUpdate", (async function (this: FurryBot, member: Eris.Member, oldState: Eris.VoiceState) {
	this.increment([
		"events.voiceStateUpdate"
	]);
	const g = await db.getGuild(member.guild.id);
}));
