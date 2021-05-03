/* eslint-disable @typescript-eslint/no-explicit-any */
import config from "../../config";
import FurryBot from "../../main";
import crypto from "node:crypto";

interface IPCMessage<T = unknown> {
	op: string;
	msg: {
		from: number;
		message: T;
		responseId: string;
	};
}

interface IPCResponse<T = unknown>{
	op: string;
	msg: T;
}

export default class IPCCommandHandler {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}

	async broadcastToWithResponse<R = unknown>(id: number, type: string, msg: any, error: false): Promise<R | "TIMEOUT">;
	async broadcastToWithResponse<R = unknown>(id: number, type: string, msg?: any, error?: true): Promise<R>;
	async broadcastToWithResponse<R = unknown>(id: number, type: string, msg?: any, error = true) {
		return new Promise<R | "TIMEOUT">((a, b) => {
			const responseId = crypto.randomBytes(16).toString("hex");
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			this.client.ipc.sendTo(id, type, { from: this.client.clusterId, message: msg, responseId });
			const t = setTimeout(() => {
				this.client.ipc.unregister(responseId);
				return error ? b(new Error("Response timeout.")) : a("TIMEOUT");
			}, 1.5e4);
			this.client.ipc.register(responseId, (v) => {
				clearTimeout(t);
				this.client.ipc.unregister(responseId);
				a((v as IPCResponse<R>).msg);
			});
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async broadcastWithResponse<R = unknown>(type: string, msg: any, error: true): Promise<Array<R>>
	async broadcastWithResponse<R = unknown>(type: string, msg?: any, error?: false): Promise<Array<R | "TIMEOUT">>
	async broadcastWithResponse<R = unknown>(type: string, msg?: any, error = false): Promise<Array<R | "TIMEOUT">> {
		const res: Array<R | "TIMEOUT"> = [];
		for (let i = 0; i < this.client.cluster.clusterCount; i++) {
			// we have to force it into one of the other
			const v = await this.broadcastToWithResponse<R>(i, type, msg, error as true);
			res.push(v);
		}
		return res;
	}

	register() {
		this.client.ipc.register("badgeCheck", (v) => this.handleBadgeCheck(v as IPCMessage<string>));
		this.client.ipc.register("ping", (v) => this.handlePing(v as IPCMessage<"PING">));
		return this;
	}

	private async handleBadgeCheck({ msg: { message: id, from: cluster, responseId } }: IPCMessage<string>) {
		const g = this.client.bot.guilds.get(config.client.supportServerId);
		if (!g) return  this.client.ipc.sendTo(cluster, responseId, "NO_GUILD");
		const m = g.members.get(id);
		if (m === undefined) return this.client.ipc.sendTo(cluster, responseId, "NOT_PRESENT");
		const j = [];
		if (m.roles.includes(config.roles.booster)) j.push("BOOSTER");
		if (m.roles.includes(config.roles.staff)) j.push("STAFF");
		return this.client.ipc.sendTo(cluster, responseId, j || "NONE");
	}

	private async handleReloadCommand() {
		// @TODO
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async handleReloadCategory(cat: string) {
		// @TODO
	}

	private async handlrReloadAll() {
		// @TODO
	}

	private handlePing({ msg: { from: cluster, responseId } }: IPCMessage<"PING">) {
		return this.client.ipc.sendTo(cluster, responseId, "PONG");
	}
}
