module.exports = (async(client) => {
	const blapi = require("blapi"),
		config = require("../config");
	blapi.manualPostSharded(client.bot.guilds.size,client.bot.user.id,config.botLists,0,client.bot.shards.size);
	// botblock was blocked on discordbots.org
	const rq = await require("util").promisify(require("request"))(`https://discordbots.org/api/bots/${client.bot.user.id}/stats`,{
		method: "POST",
		body: JSON.stringify({
			server_count: client.bot.guilds.size,
			shard_count: client.bot.shards.size
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: config.botLists["discordbots.org"]
		}
	})
		.then(req => JSON.parse(req.body));
	client.bot.logger.log(`Posted guild counts: ${client.bot.guilds.size}`);
	return {count:client.bot.guilds.size};
});