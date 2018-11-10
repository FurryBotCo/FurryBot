module.exports = (async (self,local) => {
	Object.assign(self,local);
	if (!self.config.developers.includes(self.author.id)) {
		return self.message.reply("You cannot run this command as you are not a developer of this bot.");
	}
	
	try {
		const r = self.r;
		var exec = self.args.join(" ");
		var res = await eval(exec);
	}catch(err){
		//return self.message.reply(`Error evaluating: ${err}`);
		if(typeof err !== "string") err = self.util.inspect(err,{showHidden:true,depth:null});
		if(err.length > 1000) {
			console.error(`Eval Command Error Output: ${err}`);
			err = "Logged To Console";
		}
		var data = {
			title: "Evaluated",
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
					value: `\`\`\`fix\nError Evaluating: ${err}\`\`\``,
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
	}
	if([null,undefined,""].includes(res)) {
		var res = "```fix\nfinished with no return```";
	} else {
		if(typeof res !== "string") res = self.util.inspect(res,{showHidden:true,depth:null});
		if(res.length > 1000) {
			console.log(`Eval Command Output: ${res}`);
			res = "Logged To Console";
		}
		res = "```js\n"+res+"```";
	}
	var data = {
		title: "Evaluated",
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