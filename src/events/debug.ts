import ClientEvent from "../util/ClientEvent";
import Logger from "../util/Logger";

export default new ClientEvent("debug", async function (info, id) {
	Logger.debug([`Cluster #${this.cluster.id}`, [undefined, null].includes(id) ? "General" : `Shard #${id}`], info);
});
