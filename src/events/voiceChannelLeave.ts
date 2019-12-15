import ClientEvent from "../util/ClientEvent";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("voiceChannelLeave", (async function (this: FurryBot, member: Eris.Member, oldChannel: Eris.VoiceChannel) {
	this.increment([
		"events.voiceChannelLeave"
	]);
	const g = await db.getGuild(member.guild.id);
}));
