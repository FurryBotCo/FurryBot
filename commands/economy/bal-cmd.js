const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

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
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let embed, data, u;
		u = await mdb.collection("users").findOne({id: message.author.id});
		if(!u.bal) {
			await mdb.collection("users").findOneAndUpdate({id: message.author.id},{
				$set: {
					bal: 100
				}
			});
			u.bal = 100;
		}
		if(!u.bank) {
			await mdb.collection("users").findOneAndUpdate({id: message.author.id},{
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