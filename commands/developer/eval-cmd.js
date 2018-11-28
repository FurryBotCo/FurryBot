module.exports = (async (self,local) => {
	if (!self.config.developers.includes(local.author.id)) {
		return local.message.reply("You cannot run this command as you are not a developer of this bot.");
	}
	local.channel.startTyping();
	try {
		const r = self.r;
		var exec = local.args.join(" ");
		var start = self.performance.now();
		var res = await eval(exec);
		var end = self.performance.now();
	}catch(e){
		//return local.message.reply(`Error evaluating: ${err}`);
		var m = typeof e.message !== "string" ? self.util.inspect(e.message,{depth: 3}) : e.message;
		console.log(self.util.inspect(e.message,{depth: 3}));
		var res = e.length > 1000 ? "Logged To Console" : `\`\`\`fix\nError Evaluating:\n${e.name}: ${m}\`\`\``;
		var data = {
			title: `Evaluated - Time: \`\`${(end-start).toFixed(3)}ms\`\``,
			author: {
				name: local.author.tag,
				icon_url: local.author.displayAvatarURL()
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

		console.error(`[Eval]: ${self.util.inspect(e,{depth: 3,color:true})}`);
		Object.assign(data,local.embed_defaults()());
		var embed = new self.Discord.MessageEmbed(data);
		local.channel.send(embed).catch(err => {
			local.channel.send(`I could not return the result: ${err}`).catch(error=>{
				local.author.send(`I could not return the result: ${error}`).catch(noerr=>null);
			});
		});
		return local.channel.stopTyping();
	}
	if([null,undefined,""].includes(res)) {
		var res = "```fix\nfinished with no return```";
	} else {
		if(typeof res !== "string") res = self.util.inspect(res,{showHidden:true,depth: 3});
		if(res.length > 1000) {
			console.log(`[Eval]: ${res}`);
			res = "Logged To Console";
		}
		res = "```js\n"+res+"```";
	}
	var data = {
		title: `Evaluated - Time: \`${(end-start).toFixed(3)}ms\``,
		author: {
			name: local.author.tag,
			icon_url: local.author.displayAvatarURL()
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
	}
	
	Object.assign(data,local.embed_defaults()());
	var embed = new self.Discord.MessageEmbed(data);
	local.channel.send(embed).catch(err => {
		console.error(err);
		local.channel.send(`I could not return the result: ${err}`).catch(error=>{
			local.author.send(`I could not return the result: ${err}`).catch(noerr=>null);
		});
	});
	return local.channel.stopTyping();
});