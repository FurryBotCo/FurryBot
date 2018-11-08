const config = require("./config.js");
const logger = require("./utility/logger.js");
const { ShardingManager } = require('discord.js');
const custom = Object.assign({}, require("./utility/misc.js"), require("./utility/functions.js"));
//const manager = new ShardingManager(`bot.js`, {totalShards: 2});

//manager.spawn();
//manager.on('launch', shard => {console.debug(`Successfully launched shard ${shard.id+1} (ID: ${shard.id})`);console.debug(`Memory: ${custom.getUsedMemory("MB")}/${custom.getTotalMemory("MB")}`)});
if(config.beta) {
	console.warn(`[ShardingManager] Warning! Launching beta version of bot.. (waiting ${.5e3/1000} seconds)`);
	setTimeout(function(token){
		const manager = new ShardingManager(`bot.js`, {token: config.bot.token, respawn: true, totalShards: config.bot.shardCount});

		manager.spawn();
		manager.on('launch', (shard) => {
			console.debug(`Successfully launched shard ${shard.id+1} (ID: ${shard.id})`);
			console.debug(`Memory: ${custom.getUsedMemory("MB")}/${custom.getTotalMemory("MB")}`)
		});
	}, .5e3, config.bot.token);
} else {
	console.log(`Launching normal bot..`);
	const manager = new ShardingManager(`bot.js`, {token: config.bot.token, respawn: true, totalShards: config.bot.shardCount});

	manager.spawn();
	manager.on('launch', (shard) => {
		console.debug(`Successfully launched shard ${shard.id+1} (ID: ${shard.id})`);
		console.debug(`Memory: ${custom.getUsedMemory("MB")}/${custom.getTotalMemory("MB")}`)
	});
}