module.exports = {
	triggers: [
		"shell",
		"sh"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Execute shell code (dev only)",
	usage: "[args]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) {
			return message.reply("You cannot run this command as you are not a developer of this bot.");
		}
		message.channel.startTyping();
		var exec = message.unparsedArgs.join(" ");
		var start = this.performance.now();
		try {
			var res = await this.shell(exec);
		}catch(e){
			var res = e.length > 1000 ? "Logged To Console" : `\`\`\`fix\nError Executing:\n${typeof res !== "undefined" && ![null,undefined,""].includes(res.stderr) ? res.stderr : e}\`\`\``;
			var end = this.performance.now();
			var data = {
				title: `Executed - Time: \`\`${(+end-start).toFixed(3)}ms\`\``,
				author: {
					name: message.author.tag,
					icon_url: message.author.displayAvatarURL()
				},
				color: 3322313,
				fields: [
					{
						name: ":inbox_tray: Input",
						value: `\`\`\`fix\n${exec}\`\`\``,
						inline: false
					}, {
						name: ":outbox_tray: Output",
						value: res,
						inline: false
					}
				]
			}
	
			this.logger.error(`[Eval]: ${typeof res !== "undefined" && ![null,undefined,""].includes(res.stderr) ? res.stderr : e}`);
			Object.assign(data,message.embed_defaults());
			var embed = new this.Discord.MessageEmbed(data);
			message.channel.send(embed).catch(err => {
				message.channel.send(`I could not return the result: ${err}`).catch(error=>{
					message.author.send(`I could not return the result: ${error}`).catch(noerr=>null);
				});
			});
			return message.channel.stopTyping();
		}
		if([null,undefined,""].includes(res.stdout)) {
			var res = "```fix\nfinished with no return```";
		} else {
			if(res.length > 1000) {
				console.log(`[Eval]: ${res.stdout}`);
				res = "Logged To Console";
			}
			res = "```fix\n"+res.stdout+"```";
		}
		var end = this.performance.now();
		var data = {
			title: `Executed - Time: \`${(+end-start).toFixed(3)}ms\``,
			author: {
				name: message.author.tag,
				icon_url: message.author.displayAvatarURL()
			},
			color: 3322313,
			fields: [
				{
					name: ":inbox_tray: Input",
					value: "```fix\n"+exec+"```",
					inline: false
				}, {
					name: ":outbox_tray: Output",
					value: res,
					inline: false
				}
			]
		}
		
		Object.assign(data,message.embed_defaults());
		var embed = new this.Discord.MessageEmbed(data);
		message.channel.send(embed).catch(err => {
			console.error(err);
			message.channel.send(`I could not return the result: ${err}`).catch(error=>{
				message.author.send(`I could not return the result: ${err}`).catch(noerr=>null);
			});
		});
		return message.channel.stopTyping();
	})
};