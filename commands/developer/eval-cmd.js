module.exports = (async (self) => {
	if (self.config.developers.indexOf(self.author.id) === -1) {
		return self.message.reply("You cannot run this command as you are not a bot owner.");
	}
	
	try {
	var exec = self.args.join(" ");
	var res = await eval(exec);
	}catch(err){
		return self.message.reply(`Error evaluating: ${err}`);
	}
	if(res === "") {
		var res = "finished with no return";
	} else {
		try {
			var j=JSON.stringify(res);
			var res = "```json\n"+j+"```";
		}catch(e){
			var res = res;
		}
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
				value: exec,
				inline: false
			}, {
				name: ":outbox_tray:  Output",
				value: res,
				inline: false
			}
		]
	};
	var embed = new self.MessageEmbed(data);
	self.channel.send(embed).catch(err => {
		console.error(err);
		self.author.send(`I could not return the result: ${err}`).catch(noerr=>null);
	});
});