module.exports = {
	triggers: [
        "prune",
        "purge",
        "clear"
    ],
	userPermissions: [
        "MANAGE_MESSAGES"
    ],
	botPermissions: [
        "MANAGE_MESSAGES"
    ],
	cooldown: .5e3,
	description: "Clear messages in a channel",
	usage: "<2-100>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        if(message.args.length < 1 || isNaN(message.args[0])) return new Error("ERR_INVALID_USAGE");
        if(message.args[0] < 2 || message.args[0] > 100) return message.reply("Please provide a number between 2");
        message.delete().catch(noerr=>null);
        return message.channel.bulkDelete(message.args[0],true);
    })
};