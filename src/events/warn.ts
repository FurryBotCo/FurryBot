import ClientEvent from "../util/ClientEvent";
import Logger from "../util/Logger";

export default new ClientEvent("warn", async function (info, id) {
	if (info.indexOf("Unhandled MESSAGE_CREATE type") !== -1) return;
	Logger.warn([`Cluster #${this.cluster.id}`, [undefined, null].includes(id) ? "General" : `Shard #${id}`], info);
});
