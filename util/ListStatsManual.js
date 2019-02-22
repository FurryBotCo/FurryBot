module.exports = (async(guildCount = 0,shardCount = 1) => {
	const client = {
		guilds: {
			size: guildCount,
		},
		user: {
			id: "398251412246495233"
		},
		config: {
			botLists: require("../conf/botLists")
		},
		options: {
			shardCount
		},
		logger: console
	};
	const blapi = require("blapi");
	blapi.manualPost(client.guilds.size,client.user.id,client.config.botLists);
	// botblock was blocked on discordbots.org
	const rq = await require("util").promisify(require("request"))(`https://discordbots.org/api/bots/${client.user.id}/stats`,{
		method: "POST",
		body: JSON.stringify({
			server_count: client.guilds.size,
			shard_count: client.options.shardCount
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: client.config.botLists["discordbots.org"]
		}
	})
		.then(req => JSON.parse(req.body));
	client.logger.log(`Posted guild counts: ${client.guilds.size}`);
	return {count:client.guilds.size};
});