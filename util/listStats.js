module.exports = (async(client) => {
	const blapi = require("blapi"),
		config = require("../config");
	blapi.manualPostSharded(client.guilds.size,client.user.id,config.botLists,0,client.shards.size);
	// botblock was blocked on discordbots.org
	const rq = await require("util").promisify(require("request"))(`https://discordbots.org/api/bots/${client.user.id}/stats`,{
		method: "POST",
		body: JSON.stringify({
			server_count: client.guilds.size,
			shard_count: client.shards.size
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: config.botLists["discordbots.org"]
		}
	})
		.then(req => JSON.parse(req.body));
	client.logger.log(`Posted guild counts: ${client.guilds.size}`);
	return {count:client.guilds.size};
});