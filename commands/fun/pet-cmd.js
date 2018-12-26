module.exports = {
	triggers: [
		"pet"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Pet someone ^w^",
	usage: "<@user or text>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
	
		var input = message.args.join(" ");
		var text = client.varParse(message.c,{author:message.author,input:input});
		message.channel.send(text);
		
		if(!message.gConfig.deleteCommands) {
			message.delete().catch(noerr => {});
		}
	})
};