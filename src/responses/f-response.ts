import FurryBot from "@FurryBot";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import AutoResponse from "../modules/cmd/AutoResponse";
import * as Eris from "eris";
import functions from "../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../config/config";
import { mdb } from "../modules/Database";

export default new AutoResponse({
	triggers: [
		"f",
		"rip"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 1e3
}, async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.gConfig.fResponseEnabled) {
		let count = await mdb.collection("stats").findOne({ id: "fCount" }).then(res => parseInt(res.count, 10)).catch(err => 1);
		await mdb.collection("stats").findOneAndUpdate({ id: "fCount" }, { $set: { count: ++count } });
		return msg.channel.createMessage(`<@!${msg.author.id}> has paid respects.\n\nRespects paid total: **${count}**\n\nYou can turn this auto response off by using \`${msg.gConfig.prefix}settings fResponse disabled\``);
	}
	else return;
});