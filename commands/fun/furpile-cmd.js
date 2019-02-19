module.exports = {
	triggers: [
		"furpile",
		"pileon",
		"pile"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Start a furpile on someone or join in!",
	usage: "<@user>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let usr, gConfig;
		if(message.args.length === 0 && !message.client.furpile[message.guild.id]) {
			return message.reply(`A furpile is not currently active, or has timed out due to inactivity.${"\n"}start one by running the command **${gConfig.prefix}furpile <user>**${"\n"}(do not include the < >)`);
		}
		if(message.args.length === 0 && typeof message.client.furpile[message.guild.id].fnc !== "undefined") {
			if(message.client.furpile[message.guild.id].currentUsers.has(message.author.id) && message.client.config.developers.indexOf(message.author.id) === -1) {
				return message.reply(`${message.client.config.emojis.cooldown}\nYou are already in this furpile, you cannot join again!`);
			}
			clearTimeout(message.client.furpile[message.guild.id].fnc);
			message.client.furpile[message.guild.id].currentUsers.add(message.author.id);
			message.client.furpile[message.guild.id].number++;
			message.channel.send(`<@!${message.member.id}> has joined a furpile on <@!${message.client.furpile[message.guild.id].user}>!${"\n"}<@!${message.client.furpile[message.guild.id].user}> Now has ${message.client.furpile[message.guild.id].number} furs on them!`);
			if(message.client.furpile[message.guild.id].number === 7) {
				message.channel.send(`Poor <@!${message.client.furpile[message.guild.id].user}>, you furs must be crushing them!`);
			}
			message.client.furpile[message.guild.id].fnc=setTimeout(function(gid){message.client.furpile[gid]=undefined;}, 3e5, message.guild.id);
		} else {
			if(!message.mentions) {
				return message.reply("please mention a user");
			}
			usr = message.mentions.members.first();
			if(!usr) {
				return message.reply("failed to fetch specified user.");
			}
			
			if(message.author.id === usr.id && message.client.config.developers.indexOf(message.author.id) === -1) {
				return message.reply(`${message.client.config.emojis.cooldown}\nYou cannot start a furpile on yourmessage.client!`);
			}
			message.client.furpile[message.guild.id]={
				user: usr.id,
				currentUsers: new Set(),
				number: 1,
				fnc: setTimeout(function(gid){message.client.furpile[gid]=undefined;}, 3e5, message.guild.id)
			};
			message.client.furpile[message.guild.id].currentUsers.add(message.author.id);
			message.client.furpile[message.guild.id].currentUsers.add(usr.id);
			message.channel.send(`<@!${message.member.id}> has started a furpile on <@!${message.client.furpile[message.guild.id].user}>${"\n"}Join by using the command **${message.gConfig.prefix}furpile**!`);
		}
	})
};