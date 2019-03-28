module.exports = {
	triggers: [
		"botlistinfo",
		"blinfo",
		"bl"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get the info of a bot on botlists",
	usage: "<@bot/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		message.channel.startTyping();
		let user, data, req, b, rs, list, embed;
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
		data = {
			title: "Botlist Info",
			description: "All links redirect from our api to make keeping links up to date easier.",
			fields: [

			]
		}	
		b.forEach((l,c) => {
			data.fields.push({
				name: `List #${+c+1}`,
				value: l,
				inline: false
			});
		});
		Object.assign(data, message.embed_defaults());
		data.thumbnail = {
			url: user.displayAvatarURL()
		};
		embed = new this.Discord.MessageEmbed(data);
		message.channel.send(embed);
		return message.channel.stopTyping();
	})
};