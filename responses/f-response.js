module.exports = {
	triggers: [
		"f",
		"rip"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	run: (async function(message) {
		if(!message.gConfig.fResponseEnabled) return;
		let f;
		f = await this.mdb.collection("stats").findOne({id: "fCount"});
		if(!f) await this.mdb.collection("stats").insertOne({id: "fCount", count: 0});
		f = await this.mdb.collection("stats").findOne({id: "fCount"});
		await this.mdb.collection("stats").findOneAndUpdate({id: "fCount"},{$set: {count: parseInt(f.count,10)+1}});
		return message.channel.send(`<@!${message.author.id}> has paid respects.\n\nRespects paid total: ${parseInt(f.count)+1}\n\n(You can toggle this off with \`${message.gConfig.prefix}togglefresponse\`)`);
	})
};