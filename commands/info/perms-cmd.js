module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	return message.channel.send(`You can check my current permissions here: https://api.furrybot.me/permissions#${message.guild.me.permissions.bitfield}`);
});