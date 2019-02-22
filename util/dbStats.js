module.exports = (async(client) => {
	return new Promise(async(resolve,reject) => {
        
		let j = await client.mdb.collection(client.config.db.collections.stats).findOne({id: "messageCount"});
        
		if(!j) {
			await client.mdb.collection(client.config.db.collections.stats).insertOne({
				id: "messageCount",
				count: 0,
				dmCount: 0,
			});
            
			j = await client.mdb.collection(client.config.db.collections.stats).findOne({id: "messageCount"});
		}
        
		await client.mdb.collection(client.config.db.collections.stats).findOneAndUpdate({id: "messageCount"},{
			$set: {
				count: +j.count + client.stats.messagesSinceLastPost,
				dmCount: +j.dmCount + client.stats.dmMessagesSinceLastPost
			}
		});
        
		client.stats.messagesSinceLastPost = 0;
		client.stats.dmMessagesSinceLastPost = 0;
		//client.stats.commandTotalsSinceLastPost = 0;
        
		if(!client.logger) {
			console.debug("Posted db stats");
		} else {
			client.logger.debug("Posted db stats");
		}
        
		// return client.mdb.collection("stats").findOne({id: "general"});
		resolve(client.mdb.collection(client.config.db.collections.stats).findOne({id: "messageCount"}));
	});
});