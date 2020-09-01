import ClientEvent from "../../util/ClientEvent";
import Logger from "../../util/Logger";

export default new ClientEvent("error", async function (info, id) {
	Logger.error([`Cluster #${this.cluster.id}`, [undefined, null].includes(id) ? "General" : `Shard #${id}`], info);
});
