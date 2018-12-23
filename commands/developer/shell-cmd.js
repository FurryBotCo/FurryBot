module.exports = {
	triggers: [
		"shell",
		"sh"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "Execute shell code (dev only)",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (self,local) => {
		// extra check, to be safe
		if (!self.config.developers.includes(local.author.id)) {
			return local.message.reply("You cannot run this command as you are not a developer of this bot.");
		}
		local.channel.startTyping();
		var exec = local.args.join(" ");
		var start = self.performance.now();
		try {
			var res = await self.shell(exec);
		}catch(e){
			var res = e.length > 1000 ? "Logged To Console" : `\`\`\`fix\nError Executing:\n${typeof res !== "undefined" && ![null,undefined,""].includes(res.stderr) ? res.stderr : e}\`\`\``;
			var end = self.performance.now();
			var data = {
				title: `Executed - Time: \`\`${(+end-start).toFixed(3)}ms\`\``,
				author: {
					name: local.author.tag,
					icon_url: local.author.displayAvatarURL()
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
	
			self.logger.error(`[Eval]: ${typeof res !== "undefined" && ![null,undefined,""].includes(res.stderr) ? res.stderr : e}`);
			Object.assign(data,local.embed_defaults());
			var embed = new self.Discord.MessageEmbed(data);
			local.channel.send(embed).catch(err => {
				local.channel.send(`I could not return the result: ${err}`).catch(error=>{
					local.author.send(`I could not return the result: ${error}`).catch(noerr=>null);
				});
			});
			return local.channel.stopTyping();
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
		var end = self.performance.now();
		var data = {
			title: `Executed - Time: \`${(+end-start).toFixed(3)}ms\``,
			author: {
				name: local.author.tag,
				icon_url: local.author.displayAvatarURL()
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
		
		Object.assign(data,local.embed_defaults());
		var embed = new self.Discord.MessageEmbed(data);
		local.channel.send(embed).catch(err => {
			console.error(err);
			local.channel.send(`I could not return the result: ${err}`).catch(error=>{
				local.author.send(`I could not return the result: ${err}`).catch(noerr=>null);
			});
		});
		return local.channel.stopTyping();
	})
};