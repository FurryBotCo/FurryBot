module.exports = {
	triggers: [
		"eval",
		"exec",
		"ev",
		"e"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Evaluate code (dev only)",
	usage: "<code>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		// extra check, to be safe
		if (!message.client.config.developers.includes(message.author.id)) return message.reply("You cannot run this command as you are not a developer of this bot.");
		let exec, start, res, m, end, data, embed;
		message.channel.startTyping();
		const r = message.client.r;
		exec = message.unparsedArgs.join(" ");
		start = message.client.performance.now();
		try {
			res = await eval(exec);
		}catch(e){
			//return message.reply(`Error evaluating: ${err}`);
			m = typeof e.message !== "string" ? message.client.util.inspect(e.message,{depth: 1}) : e.message;
			console.log(message.client.util.inspect(e.message,{depth: 1}));
			res = e.length > 1000 ? "Logged To Console" : `\`\`\`fix\nError Evaluating:\n${e.name}: ${m}\`\`\``;
			end = message.client.performance.now();
			if(e.length > 6000) {
				const req = await message.client.request("https://pastebin.com/api/api_post.php",{
					method: "POST",
					form: {
						"api_dev_key": message.client.config.apis.pastebin.devKey,
						"api_user_key": message.client.config.apis.pastebin.userKey,
						"api_option": "paste",
						"api_paste_code": e,
						"api_paste_private": 2,
						"api_paste_name": "Furry Bot Eval",
						"api_paste_expire_date": "N"
					}
				});
				res = `Uploaded ${req.body.toString()}`;
			}
			data = {
				title: `Evaluated - Time: \`\`${(end-start).toFixed(3)}ms\`\``,
				author: {
					name: message.author.tag,
					icon_url: message.author.displayAvatarURL()
				},
				color: 3322313,
				fields: [
					{
						name: ":inbox_tray:  Input",
						value: `\`\`\`js\n${exec}\`\`\``,
						inline: false
					}, {
						name: ":outbox_tray:  Output",
						value: res,
						inline: false
					}
				]
			};
	
			console.error(`[Eval]: ${message.client.util.inspect(e,{depth: 3,color:true})}`);
			Object.assign(data,message.embed_defaults());
			embed = new message.client.Discord.MessageEmbed(data);
			message.channel.send(embed).catch(err => {
				message.channel.send(`I could not return the result: ${err}`).catch(error => {
					message.author.send(`I could not return the result: ${error}`).catch(noerr => null);
				});
			});
			return message.channel.stopTyping();
		}
		if([null,undefined,""].includes(res)) {
			res = "```fix\nfinished with no return```";
		} else {
			if(typeof res !== "string") res = message.client.util.inspect(res,{showHidden:true,depth: 3});
			if(res.length > 6000) {
				const req = await message.client.request("https://pastebin.com/api/api_post.php",{
					method: "POST",
					form: {
						"api_dev_key": message.client.config.apis.pastebin.devKey,
						"api_user_key": message.client.config.apis.pastebin.userKey,
						"api_option": "paste",
						"api_paste_code": res,
						"api_paste_private": 2,
						"api_paste_name": "Furry Bot Eval",
						"api_paste_expire_date": "N"
					}
				});
				res = `Uploaded ${req.body.toString()}`;
			} else if(res.length > 1000) {
				console.log(`[Eval]: ${res}`);
				res = "Logged To Console";
			}
			res = "```js\n"+res+"```";
		}
		end = message.client.performance.now();
		data = {
			title: `Evaluated - Time: \`${(end-start).toFixed(3)}ms\``,
			author: {
				name: message.author.tag,
				icon_url: message.author.displayAvatarURL()
			},
			color: 3322313,
			fields: [
				{
					name: ":inbox_tray:  Input",
					value: "```js\n"+exec+"```",
					inline: false
				}, {
					name: ":outbox_tray:  Output",
					value: res,
					inline: false
				}
			]
		};
		
		Object.assign(data,message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		message.channel.send(embed).catch(err => {
			console.error(err);
			message.channel.send(`I could not return the result: ${err}`).catch(error => {
				message.author.send(`I could not return the result: ${err}`).catch(noerr => null);
			});
		});
		return message.channel.stopTyping();
	})
};