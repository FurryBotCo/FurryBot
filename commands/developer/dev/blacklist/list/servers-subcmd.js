const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../../../../modules/CommandRequire");

module.exports = {
	triggers: [
		"servers",
		"s",
		"guilds",
		"g"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Lists blacklisted servers",
	usage: "<page>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		
		let entries = await mdb.collection("guilds").find({ blacklisted: true }).toArray();

		let e = [];

		let page = 1;

		if(message.args.length > 0)  page = parseInt(message.args[0],10);

		const client = this;
		for(let en of entries) {
			let s;
			if(this.bot.guilds.has(en.id)) s = await this.bot.getRESTGuild(en.id);
			else s = null;

			if(!s) e.push(`\`${en.id}\` - ${en.blacklistReason}`);
			else e.push(`\`${s.name}\` (\`${en.id}\`) - ${en.blacklistReason}`);
		}

		let ee = [];

		let i = 0;
		for(let entry of e) {
			if([undefined,null,""].includes(ee[i])) ee[i] = [];
			
			if(ee[i].join("\n").length >= 1950 || ee[i].join("\n").length + entry.length >= 1950) i++;
			ee[i].push(entry);
		}

		if(page < 1 || page > ee.length) return message.reply(`Invalid page number ${page}, valid: 1-${ee.length}`);

		let embed = {
			title: `Server Blacklist List ${page}/${ee.length}`,
			description: ee[page - 1].join("\n")
		};
		Object.assign(embed,message.embed_defaults());

		return message.channel.createMessage({ embed });
	})
};