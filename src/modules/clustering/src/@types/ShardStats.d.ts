import Eris from "eris";

export default interface ShardStats {
	id: number;
	ready: boolean;
	latency: number;
	status: Eris.Shard["status"];
	guildCount: number;
	lastHeartbeatReceived: number;
	lastHeartbeatSent: number;
}
