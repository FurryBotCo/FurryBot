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
	run: (async (client,message) => {
		// extra check, to be safe
		if (!client.config.developers.includes(message.author.id)) {
			return message.reply("You cannot run this command as you are not a developer of this bot.");
		}
		message.channel.startTyping();
		const r = client.r;
		var exec = message.unparsedArgs.join(" ");
		var start = client.performance.now();
		try {
			var res = await eval(exec);
		}catch(e){
			//return message.reply(`Error evaluating: ${err}`);
			var m = typeof e.message !== "string" ? client.util.inspect(e.message,{depth: 1}) : e.message;
			console.log(client.util.inspect(e.message,{depth: 1}));
			var res = e.length > 1000 ? "Logged To Console" : `\`\`\`fix\nError Evaluating:\n${e.name}: ${m}\`\`\``;
			var end = client.performance.now();
			var data = {
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
			}
	
			console.error(`[Eval]: ${client.util.inspect(e,{depth: 3,color:true})}`);
			Object.assign(data,message.embed_defaults());
			var embed = new client.Discord.MessageEmbed(data);
			message.channel.send(embed).catch(err => {
				message.channel.send(`I could not return the result: ${err}`).catch(error => {
					message.author.send(`I could not return the result: ${error}`).catch(noerr => null);
				});
			});
			return message.channel.stopTyping();
		}
		if([null,undefined,""].includes(res)) {
			var res = "```fix\nfinished with no return```";
		} else {
			if(typeof res !== "string") res = client.util.inspect(res,{showHidden:true,depth: 3});
			if(res.length > 1000) {
				console.log(`[Eval]: ${res}`);
				res = "Logged To Console";
			}
			res = "```js\n"+res+"```";
		}
		var end = client.performance.now();
		var data = {
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
		var embed = new client.Discord.MessageEmbed(data);
		message.channel.send(embed).catch(err => {
			console.error(err);
			message.channel.send(`I could not return the result: ${err}`).catch(error => {
				message.author.send(`I could not return the result: ${err}`).catch(noerr => null);
			});
		});
		return message.channel.stopTyping();
	})
};