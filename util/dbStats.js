module.exports = (async(client)=>{
	return new Promise(async(resolve,reject)=>{
        
		let j = await client.r.table(client.config.db.tables.stats).get("messageCount");
        
		if(!j) {
			await client.r.table(client.config.db.tables.stats).insert({
				id: "messageCount",
				count: 0,
				dmCount: 0,
			});
            
			j = await client.r.table(client.config.db.tables.stats).get("messageCount");
		}
        
		await client.r.table(client.config.db.tables.stats).get("messageCount").update({
			count: +j.count + client.stats.messagesSinceLastPost,
			dmCount: +j.dmCount + client.stats.dmMessagesSinceLastPost
		});
        
		client.stats.messagesSinceLastPost = 0;
		client.stats.dmMessagesSinceLastPost = 0;
		//client.stats.commandTotalsSinceLastPost = 0;
        
		if(!client.logger) {
			console.debug("Posted db stats");
		} else {
			client.logger.debug("Posted db stats");
		}
        
		// return client.r.table("stats").get("general").without("id");
		resolve(client.r.table(client.config.db.tables.stats).get("messageCount"));
	});
});