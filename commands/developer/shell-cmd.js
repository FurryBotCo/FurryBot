module.exports = {
	triggers: [
		"shell",
		"sh"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 0,
	description: "Execute shell code (dev only)",
	usage: "[args]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		// extra check, to be safe
		if (!this.config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		let exec, start, res, end, embed;
		exec = message.unparsedArgs.join(" ");
		start = this.performance.now();
		try {
			res = await this.shell(exec);
		}catch(e){
			res = e.length > 1000 ? "Logged To Console" : `\`\`\`fix\nError Executing:\n${typeof res !== "undefined" && ![null,undefined,""].includes(res.stderr) ? res.stderr : e}\`\`\``;
			end = this.performance.now();
			if(e.length > 6000) {
				const req = await this.request("https://pastebin.com/api/api_post.php",{
					method: "POST",
					form: {
						"api_dev_key": this.config.apis.pastebin.devKey,
						"api_user_key": this.config.apis.pastebin.userKey,
						"api_option": "paste",
						"api_paste_code": e,
						"api_paste_private": 2,
						"api_paste_name": "Furry Bot Eval",
						"api_paste_expire_date": "N"
					}
				});
				res = `Uploaded ${req.body.toString()}`;
			}
			embed = {
				title: `Executed - Time: \`\`${(+end-start).toFixed(3)}ms\`\``,
				author: {
					name: `${message.author.username}#${message.author.discriminator}`,
					icon_url: message.author.avatarURL
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
			};
	
			this.logger.error(`[Eval]: ${typeof res !== "undefined" && ![null,undefined,""].includes(res.stderr) ? res.stderr : e}`);
			Object.assign(embed,message.embed_defaults());
			return message.channel.createMessage({ embed }).catch(err => {
				message.channel.createMessage(`I could not return the result: ${err}`).catch(error => {
					message.author.getDMChannel().then(dm => dm.createMessage(`I could not return the result: ${error}`)).catch(noerr => null);
				});
			});
		}
		if([null,undefined,""].includes(res.stdout)) {
			res = "```fix\nfinished with no return```";
		} else {
			if(res.length > 6000) {
				const req = await this.request("https://pastebin.com/api/api_post.php",{
					method: "POST",
					form: {
						"api_dev_key": this.config.apis.pastebin.devKey,
						"api_user_key": this.config.apis.pastebin.userKey,
						"api_option": "paste",
						"api_paste_code": res,
						"api_paste_private": 2,
						"api_paste_name": "Furry Bot Eval",
						"api_paste_expire_date": "N"
					}
				});
				res = `Uploaded ${req.body.toString()}`;
			} else if(res.length > 1000) {
				this.logger.log(`[Eval]: ${res.stdout}`);
				res = "Logged To Console";
			}
			res = "```fix\n"+res.stdout+"```";
		}
		end = this.performance.now();
		embed = {
			title: `Executed - Time: \`${(+end-start).toFixed(3)}ms\``,
			author: {
				name: `${message.author.username}#${message.author.discriminator}`,
				icon_url: message.author.avatarURL
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
		};
		
		Object.assign(embed,message.embed_defaults());
		return message.channel.createMessage({ embed }).catch(err => {
			this.logger.error(err);
			message.channel.createMessage(`I could not return the result: ${err}`).catch(error => {
				message.author.getDMChannel().then(dm => dm.createMessage(`I could not return the result: ${err}`)).catch(noerr => null);
			});
		});
	})
};