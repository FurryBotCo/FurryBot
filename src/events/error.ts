import ClientEvent from "../util/ClientEvent";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import ExtendedMessage from "@ExtendedMessage";

export default new ClientEvent("error", (async function (this: FurryBot, info, id?: number) {
	this.increment([
		"events.error"
	]);
	if (typeof info === "string") {
		if (Logger !== undefined) return Logger.error(`Shard #${id} | Client`, info);
		else return console.error(info);
	} else {
		switch (info.type) {
			case "SIGINT":
			case "SIGTERM":
				Logger.error("Client", `${info.type} recieved, signal: ${info.data.signal}. Killing process.`);
				this.disconnect({ reconnect: false });
				process.kill(process.pid);
				break;

			case "uncaughtException":
				return Logger.error("Uncaught Exception", info.data.error);
				break;

			case "unhandledRejection":
				try {
					Logger.error("Unhandled Rejection | Reason", info.data.reason);
					Logger.error("Unhandled Rejection | Promise", info.data.promise);
				} catch (e) {
					Logger.error("Error Handler Error", e);
					Logger.error("Error Handler Error", info);
				}
				break;

			default:
				return Logger.error("Unknown Error", info);
		}
	}
}));
