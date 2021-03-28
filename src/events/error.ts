import FurryBot from "../main";
import LocalFunctions from "../util/LocalFunctions";
import { ClientEvent } from "core";
import Logger from "logger";

export default new ClientEvent<FurryBot>("error", async function (info, id) {
	await LocalFunctions.logError(this, info instanceof Error ? info : new Error(info), "event", {});
	Logger.error([`Cluster #${this.clusterId}`, !id ? "General" : `Shard #${id}`], info);
});
