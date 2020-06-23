import ShardStats from "./ShardStats";

export default interface ClusterStats {
	shards: ShardStats[];
	guildCount: number;
	channelCount: number;
	userCount: number;
	voiceConnections: number;
	largeGuilds: number;
	id: number;
}
