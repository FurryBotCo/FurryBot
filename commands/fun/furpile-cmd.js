module.exports = (async (self,local) => {
	
	if(local.args.length === 0 && !self.furpile[local.guild.id]) {
		return local.message.reply(`A furpile is not currently active, or has timed out due to inactivity.${"\n"}start one by running the command **${gConfig.prefix}furpile <user>**${"\n"}(do not include the < >)`);
	}
	if(local.args.length === 0 && typeof self.furpile[local.guild.id].fnc !== "undefined") {
		if(self.furpile[local.guild.id].currentUsers.has(local.author.id) && self.config.developers.indexOf(local.author.id) === -1) {
			return local.message.reply(`${self.config.emojis.cooldown}\nYou are already in this furpile, you cannot join again!`);
		}
		clearTimeout(self.furpile[local.guild.id].fnc);
		self.furpile[local.guild.id].currentUsers.add(local.author.id);
		self.furpile[local.guild.id].number++;
		local.channel.send(`<@!${local.member.id}> has joined a furpile on <@!${self.furpile[local.guild.id].user}>!${"\n"}<@!${self.furpile[local.guild.id].user}> Now has ${self.furpile[local.guild.id].number} furs on them!`);
		if(self.furpile[local.guild.id].number == 7) {
			message.channel.send(`Poor <@!${self.furpile[local.guild.id].user}>, you furs must be crushing them!`);
		}
		self.furpile[local.guild.id].fnc=setTimeout(function(gid){self.furpile[gid]=undefined;}, 3e5, local.guild.id);
	} else {
		if(!local.message.mentions) {
			return local.message.reply("please mention a user");
		}
		var usr = local.message.mentions.members.first();
		if(!usr) {
			return local.message.reply(`failed to fetch specified user.`);
		}
		
		if(local.author.id == usr.id && self.config.developers.indexOf(local.author.id) === -1) {
			return local.message.reply(`${self.config.emojis.cooldown}\nYou cannot start a furpile on yourself!`);
		}
		self.furpile[local.guild.id]={};
		self.furpile[local.guild.id].user=usr.id;
		self.furpile[local.guild.id].currentUsers=new Set();
		self.furpile[local.guild.id].currentUsers.add(local.author.id);
		self.furpile[local.guild.id].currentUsers.add(usr.id);
		self.furpile[local.guild.id].number=1;
		self.furpile[local.guild.id].fnc=setTimeout(function(gid){self.furpile[gid]=undefined;}, 3e5, local.guild.id);
		local.channel.send(`<@!${local.member.id}> has started a furpile on <@!${self.furpile[local.guild.id].user}>${"\n"}Join by using the command **${local.gConfig.prefix}furpile**!`);
	}
});