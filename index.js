const config = require("./config.js");
const logger = require("./util/logger.js");
const { ShardingManager } = require('discord.js');
const custom = Object.assign({}, require("./util/misc"), require("./util/functions"));
//const manager = new ShardingManager(`bot.js`, {totalShards: 2});

//manager.spawn();
//manager.on('launch', shard => {console.debug(`Successfully launched shard ${shard.id+1} (ID: ${shard.id})`);console.debug(`Memory: ${custom.getUsedMemory("MB")}/${custom.getTotalMemory("MB")}`)});
if(config.beta) {
	console.warn(`[ShardingManager] Warning! Launching beta version of bot.. (waiting ${.5e3/1000} seconds)`);
	setTimeout(function(token){
		const manager = new ShardingManager(`main.js`, {token: config.bot.token, respawn: true, totalShards: "auto"});

		manager.spawn();
		manager.on('launch', (shard) => {
			console.debug(`Successfully launched shard ${shard.id+1} (ID: ${shard.id})`);
			console.debug(`Memory: ${custom.getUsedMemory("MB")}/${custom.getTotalMemory("MB")}`)
		});
	}, .5e3, config.bot.token);
} else {
	console.log(`Launching normal bot..`);
	const manager = new ShardingManager(`main.js`, {token: config.bot.token, respawn: true, totalShards: "auto"});

	manager.spawn();
	manager.on('launch', (shard) => {
		console.debug(`Successfully launched shard ${shard.id+1} (ID: ${shard.id})`);
		console.debug(`Memory: ${custom.getUsedMemory("MB")}/${custom.getTotalMemory("MB")}`)
	});
}