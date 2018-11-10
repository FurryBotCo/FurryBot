module.exports = (async (self,local) => {
	Object.assign(self,local);
	if(self.args.length == 0 && !self.furpile[self.guild.id]) {
		return self.message.reply(`A furpile is not currently active, or has timed out due to inactivity.${"\n"}start one by running the command **${gConfig.prefix}furpile <user>**${"\n"}(do not include the < >)`);
	}
	if(self.args.length == 0 && typeof self.furpile[self.guild.id].fnc !== "undefined") {
		if(self.furpile[self.guild.id].currentUsers.has(self.author.id) && self.config.developers.indexOf(self.author.id) === -1) {
			return self.message.reply(`${self.config.emojis.cooldown}\nYou are already in this furpile, you cannot join again!`);
		}
		clearTimeout(self.furpile[self.guild.id].fnc);
		self.furpile[self.guild.id].currentUsers.add(self.author.id);
		self.furpile[self.guild.id].number++;
		self.channel.send(`<@!${self.member.id}> has joined a furpile on <@!${self.furpile[self.guild.id].user}>!${"\n"}<@!${self.furpile[self.guild.id].user}> Now has ${self.furpile[self.guild.id].number} furs on them!`);
		if(self.furpile[self.guild.id].number == 7) {
			message.channel.send(`Poor <@!${self.furpile[self.guild.id].user}>, you furs must be crushing them!`);
		}
		self.furpile[self.guild.id].fnc=setTimeout(function(gid){self.furpile[gid]=undefined;}, 3e5, self.guild.id);
	} else {
		if(!self.message.mentions) {
			return self.message.reply(`please mention a user`);
		}
		var usr = self.message.mentions.members.first();
		if(!usr) {
			return self.message.reply(`failed to fetch specified user.`);
		}
		
		if(self.author.id == usr.id && self.config.developers.indexOf(self.author.id) === -1) {
			return self.message.reply(`${self.config.emojis.cooldown}\nYou cannot start a furpile on yourself!`);
		}
		self.furpile[self.guild.id]={};
		self.furpile[self.guild.id].user=usr.id;
		self.furpile[self.guild.id].currentUsers=new Set();
		self.furpile[self.guild.id].currentUsers.add(self.author.id);
		self.furpile[self.guild.id].currentUsers.add(usr.id);
		self.furpile[self.guild.id].number=1;
		self.furpile[self.guild.id].fnc=setTimeout(function(gid){self.furpile[gid]=undefined;}, 3e5, self.guild.id);
		self.channel.send(`<@!${self.member.id}> has started a furpile on <@!${self.furpile[self.guild.id].user}>${"\n"}Join by using the command **${self.gConfig.prefix}furpile**!`);
	}
});