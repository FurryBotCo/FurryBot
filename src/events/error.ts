import ClientEvent from "../util/ClientEvent";
import { Logger } from "../util/LoggerV8";
import FurryBot from "@FurryBot";
import config from "../config";
import rClient from "../util/Redis";

// this cannot be async due to "unhandledRejection" (unhandled promise rejection)'s not
// being able to be handled asynchronously
export default new ClientEvent("error", (function (this: FurryBot, info, id?: number) {
	rClient.INCR(`${config.beta ? "beta" : "prod"}:events:error`);
	if (typeof info === "string") {
		this.log("error", info, `${!!id ? ` Shard #${id}` : ""} | Client`);
	} else {
		switch (info.type) {
			case "uncaughtException":
				return this.log("error", info.data.error, `${!!id ? ` Shard #${id}` : ""} | Uncaught Exception`);
				break;

			case "unhandledRejection":
				try {
					this.log("error", info.data.reason, `${!!id ? ` Shard #${id}` : ""} | Unhandled Rejection | Reason`);
					this.log("error", info.data.promise, `${!!id ? ` Shard #${id}` : ""} | Unhandled Rejection | Promise`);
				} catch (e) {
					this.log("error", e, `${!!id ? ` Shard #${id}` : ""} | Error Handler Error`);
					this.log("error", info, `${!!id ? ` Shard #${id}` : ""} | Error Handler Error`);
				}
				break;

			default:
				return this.log("error", info, `${!!id ? ` Shard #${id}` : ""} | Unknown Error`);
		}
	}
}));
