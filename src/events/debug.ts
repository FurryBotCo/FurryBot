import FurryBot from "../main";
import { ClientEvent } from "core";
import Logger from "logger";

export default new ClientEvent<FurryBot>("debug", async function (info, id) {
	Logger.debug([`Cluster #${this.clusterId}`, !id ? "General" : `Shard #${id}`], info);
});
