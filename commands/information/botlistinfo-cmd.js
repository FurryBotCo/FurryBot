module.exports = {
	triggers: [
		"botlistinfo",
		"blinfo",
		"bl"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16834
	],
	cooldown: 2e3,
	description: "Get the info of a bot on botlists",
	usage: "<@bot/id>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let user, req, b, rs, list, embed, i;
		list = [];
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		// get user from message
		user = await message.getUserFromArgs();

		if(!user) return message.errorEmbed("INVALID_USER");

		// botlist lookup
		req = await this.request(`https://botblock.org/api/bots/${user.id}`,{
			method: "GET"
		});
		try {
			rs = JSON.parse(req.body.toString());
			for(let ls in rs.list_data) {
				const ll = rs.list_data[ls];
				if(ll[1] !== 200) continue;
				list.push(`[${ls}](https://api.furry.bot/botlistgo/${encodeURIComponent(ls)}/${encodeURIComponent(user.id)})`);
			}

			//list = Object.keys(this._.pickBy(rs.list_data,((val,key) => ([null,undefined,""].includes(val[0]) || ((typeof val[0].bot !== "undefined" && val[0].bot.toLowerCase() === "no bot found") || (typeof val[0].success !== "undefined" && [false,"false"].includes(val[0].success)))) ?  false : val[1] === 200))).map(list => ({name: list,url:`https://api.furry.bot/botlistgo.php?list=${list}&id=${user.id}`}));
		}catch(e){
			this.logger.log({
				headers: req.headers,
				body: req.body.toString(),
				statusCode: req.statusCode
			});
			this.logger.error(e);
			rs = req.body;
			list = "Lookup Failed.";
		}

		i = 0;
		b = [];
		for(let key in list) {
			if(list[key].startsWith("(")) continue;
			if(typeof b[i] === "undefined") b[i] = "";
			if(b[i].length + list[key].length >= 1000) {
				i++;
				b[i] = list[key];
			} else {
				b[i] += `${list[key]}\n`;
			}
		}
		embed = {
			title: "Botlist Info",
			description: "All links redirect from our api to make keeping links up to date easier.",
			fields: [

			]
		};	
		b.forEach((l,c) => {
			embed.fields.push({
				name: `List #${+c+1}`,
				value: l,
				inline: false
			});
		});
		Object.assign(embed, message.embed_defaults());
		embed.thumbnail = {
			url: user.avatarURL
		};
		message.channel.createMessage({ embed });
	})
};