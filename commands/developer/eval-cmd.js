module.exports = (async (self,local) => {
	Object.assign(self,local);
	if (!self.config.developers.includes(self.author.id)) {
		return self.message.reply("You cannot run this command as you are not a developer of this bot.");
	}
	
	try {
		const r = self.r;
		var exec = self.args.join(" ");
		var start = self.performance.now();
		var res = await eval(exec);
		var end = self.performance.now();
	}catch(e){
		//return self.message.reply(`Error evaluating: ${err}`);
		var m = typeof e.message !== "string" ? self.util.inspect(e.message,{depth:null}) : e.message;
		console.log(self.util.inspect(e.message,{depth:null}));
		var res = e.length > 1000 ? "Logged To Console" : `\`\`\`fix\nError Evaluating:\n${e.name}: ${m}\`\`\``;
		var data = {
			title: `Evaluated - Time: \`\`${(end-start).toFixed(3)}ms\`\``,
			author: {
				name: self.author.tag,
				icon_url: self.author.displayAvatarURL()
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
		console.error(`[Eval]: ${self.util.inspect(e,{depth:null,color:true})}`);
		Object.assign(data,self.embed_defaults);
		var embed = new self.Discord.MessageEmbed(data);
		return self.channel.send(embed).catch(err => {
			self.channel.send(`I could not return the result: ${err}`).catch(error=>{
				self.author.send(`I could not return the result: ${error}`).catch(noerr=>null);
			});
		});
	}
	if([null,undefined,""].includes(res)) {
		var res = "```fix\nfinished with no return```";
	} else {
		if(typeof res !== "string") res = self.util.inspect(res,{showHidden:true,depth:null});
		if(res.length > 1000) {
			console.log(`[Eval]: ${res}`);
			res = "Logged To Console";
		}
		res = "```js\n"+res+"```";
	}
	var data = {
		title: `Evaluated - Time: \`${(end-start).toFixed(3)}ms\``,
		author: {
			name: self.author.tag,
			icon_url: self.author.displayAvatarURL()
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
	Object.assign(data,self.embed_defaults);
	var embed = new self.Discord.MessageEmbed(data);
	return self.channel.send(embed).catch(err => {
		console.error(err);
		self.channel.send(`I could not return the result: ${err}`).catch(error=>{
			self.author.send(`I could not return the result: ${err}`).catch(noerr=>null);
		});
	});
});