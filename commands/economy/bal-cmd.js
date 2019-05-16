module.exports = {
	triggers: [
		"bal",
		"balance",
		"money"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 1e3,
	description: "Check your economy balance",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let embed, data, u;
		u = await this.mdb.collection("users").findOne({id: message.author.id});
		if(!u.bal) {
			await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
				$set: {
					bal: 100
				}
			});
			u.bal = 100;
		}
		if(!u.bank) {
			await this.mdb.collection("users").findOneAndUpdate({id: message.author.id},{
				$set: {
					bank: 0
				}
			});
			u.bank = 0;
		}
		embed = {
			title: `${message.author.username}#${message.author.discriminator}'s Balance`,
			description: `**Pocket**: ${u.bal}\n**Bank**: ${u.bank}`
		};
		Object.assign(embed, message.embed_defaults());
		message.channel.createMessage({ embed });
	})
};