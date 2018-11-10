module.exports = (async (self,local) => {
	Object.assign(self,local);
	return self.channel.send(`You can check my current permissions here: https://api.furrybot.me/permissions#${self.guild.me.permissions.bitfield}`);
});