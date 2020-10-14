import ClientEvent from "../../util/ClientEvent";
import Utility from "../../util/Functions/Utility";
import Logger from "../../util/Logger";

export default new ClientEvent("error", async function (info, id) {
	await Utility.logError(this, info, "event", {});
	Logger.error([`Cluster #${this.cluster.id}`, [undefined, null].includes(id) ? "General" : `Shard #${id}`], info);
});
