import FurryBot from "../main";
import { ClientEvent } from "core";
import Logger from "logger";

export default new ClientEvent<FurryBot>("warn", async function (info, id) {
	Logger.warn([`Cluster #${this.clusterId}`, !id ? "General" : `Shard #${id}`], info);
});
