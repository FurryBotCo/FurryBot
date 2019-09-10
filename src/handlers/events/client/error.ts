import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";

export default new ClientEvent("error", (async function (this: FurryBot, info: string, id: number) {
	if (!id) id = 0;

	await this.track("clientEvent", "events.error", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		info,
		id
	}, new Date());

	if (this.logger !== undefined) return this.logger.error(info, id);
	else return console.error(info, id);
}));