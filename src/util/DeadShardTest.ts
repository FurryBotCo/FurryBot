import FurryBot from "../main";
import Logger from "./LoggerV8";

export default class DeadShardTest {
	deadRounds: Map<number, number>;
	client: FurryBot;
	private _interval: NodeJS.Timeout;
	constructor(client: FurryBot) {
		this.client = client;
		this.deadRounds = new Map();
		this._interval = null;

		client.shards.map(s => this.deadRounds.set(s.id, 0));
		this.setup();
	}

	deadCheck(id: number) {
		const shard = this.client.shards.get(id);
		if (!shard) {
			Logger.error("DeadShardTest", `Shard #${id} not found.`);
			return null;
		}

		if (shard.status !== "ready") {
			let d = this.deadRounds.get(id);
			if ([undefined, null].includes(d)) d = this.deadRounds.set(id, 0).get(id);

			this.deadRounds.set(id, ++d);
			Logger.warn(`DeadShardTest | Round ${d}`, `Shard #${id} is not connected.`);

			if (d >= 3) {
				Logger.error(`DeadShardTest | Round ${d}`, `Shard #${id} is still not connected after ${d} rounds, restarting shard..`);
				this.client.shards.get(id).disconnect({ reconnect: false });
				setTimeout(() => this.client.shards.get(id).connect(), 500);
			}
			return true;
		} else return false;
	}

	private setup() {
		this._interval = setInterval(() => {
			if (!this.client.firstReady) Logger.warn("DeadShardTest", "Skipping test as client has not readied yet.");
			else this.client.shards.map(s => this.deadCheck(s.id));
		}, 3e4);
	}

	public stop() {
		clearInterval(this._interval);
		this._interval = null;
	}
}
