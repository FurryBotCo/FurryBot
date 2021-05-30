import config from "../../config";
import FurryBot from "../../main";


export default class IPCCommandHandler {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}

	async broadcastToWithResponse<R = unknown>(id: number, type: string, data: Record<string, unknown> | null, error: false): Promise<R | "TIMEOUT">;
	async broadcastToWithResponse<R = unknown>(id: number, type: string, data?: Record<string, unknown> | null, error?: true): Promise<R>;
	async broadcastToWithResponse<R = unknown>(id: number, type: string, data?: Record<string, unknown> | null, error = true) {
		return new Promise<R | "TIMEOUT">((a, b) => {
			const responseId = this.client.ipc.generateRandomId();
			if (data === null) data = {};
			Object.defineProperties(data, {
				responseId: {
					value: responseId,
					enumerable: true
				},
				clusterId: {
					value: this.client.clusterId,
					enumerable: true
				}
			});
			this.client.ipc.sendMessage(type, data, `cluster.${id}`);
			const t = setTimeout(() => {
				this.client.ipc.unregister(responseId);
				return error ? b(new Error("Response timeout.")) : a("TIMEOUT");
			}, 1.5e4);
			this.client.ipc.registerOnce<R>(responseId, (v) => {
				clearTimeout(t);
				a(v);
			});
		});
	}

	async broadcastWithResponse<R = unknown>(type: string, msg: Record<string, unknown> | null, error: true): Promise<Array<R>>
	async broadcastWithResponse<R = unknown>(type: string, msg?: Record<string, unknown> | null, error?: false): Promise<Array<R | "TIMEOUT">>
	async broadcastWithResponse<R = unknown>(type: string, msg?: Record<string, unknown> | null, error = false): Promise<Array<R | "TIMEOUT">> {
		const res: Array<R | "TIMEOUT"> = [];
		for (let i = 0; i < this.client.cluster.options.clusterCount; i++) {
			const v = await this.broadcastToWithResponse<R>(i, type, msg, error as true);
			res.push(v);
		}
		return res;
	}

	register() {
		this.client.ipc.register<Record<"id" | "responseId", string> & Record<"clusterId", number>>("badgeCheck", (data) => this.handleBadgeCheck(data));
		this.client.ipc.register<Record<"responseId", string> & Record<"clusterId", number>>("ping", (data) => this.handlePing(data));
		return this;
	}

	async pingCluster(id: number) {
		// ISO8601 timestamp
		return this.broadcastToWithResponse<string>(id, "ping", null, false);
	}

	private async handleBadgeCheck({ id, responseId, clusterId }: Record<"id" | "responseId", string> & Record<"clusterId", number>) {
		const g = this.client.bot.guilds.get(config.client.supportServerId);
		if (!g) return  this.client.ipc.sendToCluster(clusterId, responseId, "NO_GUILD");
		const m = g.members.get(id);
		if (m === undefined) return this.client.ipc.sendToCluster(clusterId, responseId, "NOT_PRESENT");
		const j = [];
		if (m.roles.includes(config.roles.booster)) j.push("BOOSTER");
		if (m.roles.includes(config.roles.staff)) j.push("STAFF");
		return this.client.ipc.sendToCluster(clusterId, responseId, j || "NONE");
	}

	private async handleReloadCommand() {
		// @TODO
	}

	private async handleReloadCategory() {
		// @TODO
	}

	private async handlrReloadAll() {
		// @TODO
	}

	private handlePing({ responseId, clusterId }: Record<"responseId", string> & Record<"clusterId", number>) {
		return this.client.ipc.sendToCluster(clusterId, responseId, new Date().toISOString());
	}
}
