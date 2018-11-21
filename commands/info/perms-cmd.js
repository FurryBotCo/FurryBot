module.exports = (async (self,local) => {
	
	return local.channel.send(`You can check my current permissions here: https://api.furrybot.me/permissions#${local.guild.me.permissions.bitfield}`);
});