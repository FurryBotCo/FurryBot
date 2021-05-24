/* eslint-disable @typescript-eslint/no-explicit-any */
import config from "../../config";
import FurryBot from "../../main";
import { MessageRoute } from "clustering";


export default class IPCCommandHandler {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}

	async broadcastToWithResponse<R = unknown>(id: number, type: string, data: unknown, error: false): Promise<R | "TIMEOUT">;
	async broadcastToWithResponse<R = unknown>(id: number, type: string, data?: unknown, error?: true): Promise<R>;
	async broadcastToWithResponse<R = unknown>(id: number, type: string, data?: unknown, error = true) {
		return new Promise<R | "TIMEOUT">((a, b) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const responseId = this.client.ipc.sendMessage(type, data, `cluster.${id}`);
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

	async broadcastWithResponse<R = unknown>(type: string, msg: unknown, error: true): Promise<Array<R>>
	async broadcastWithResponse<R = unknown>(type: string, msg?: unknown, error?: false): Promise<Array<R | "TIMEOUT">>
	async broadcastWithResponse<R = unknown>(type: string, msg?: unknown, error = false): Promise<Array<R | "TIMEOUT">> {
		const res: Array<R | "TIMEOUT"> = [];
		for (let i = 0; i < this.client.cluster.options.clusterCount; i++) {
			const v = await this.broadcastToWithResponse<R>(i, type, msg, error as true);
			res.push(v);
		}
		return res;
	}

	register() {
		this.client.ipc.register<string>("badgeCheck", (id, messageId, from) => this.handleBadgeCheck(id, messageId, from));
		this.client.ipc.register<null>("ping", (_, messageId, from) => this.handlePing(messageId, from));
		return this;
	}

	async pingCluster(id: number) {
		// ISO8601 timestamp
		return this.broadcastToWithResponse<string>(id, "ping", null, false);
	}

	private async handleBadgeCheck(id: string, messageId: string, from: MessageRoute) {
		const g = this.client.bot.guilds.get(config.client.supportServerId);
		if (!g) return  this.client.ipc.sendToRoute(from, messageId, "NO_GUILD");
		const m = g.members.get(id);
		if (m === undefined) return this.client.ipc.sendToRoute(from, messageId, "NOT_PRESENT");
		const j = [];
		if (m.roles.includes(config.roles.booster)) j.push("BOOSTER");
		if (m.roles.includes(config.roles.staff)) j.push("STAFF");
		return this.client.ipc.sendToRoute(from, messageId, j || "NONE");
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

	private handlePing(messageId: string, from: MessageRoute) {
		return this.client.ipc.sendToRoute(from, messageId, new Date().toISOString());
	}
}
