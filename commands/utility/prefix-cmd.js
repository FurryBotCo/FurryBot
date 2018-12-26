module.exports = {
	triggers: [
        "prefix",
        "setprefix"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 3e3,
	description: "Change the bots prefix for this guild (server)",
	usage: "<new prefix>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
        if(message.args[0].length < 1 || message.args[0].length > 30) return message.reply("Prefix must be between 1 and 30 characters.");
        await client.db.updateGuild(message.guild.id,{prefix:message.args[0].toLowerCase()});
        return message.reply(`Set this guilds prefix to ${message.args[0].toLowerCase()}, you can view the current prefix at any time by typing \`whatismyprefix\`, or mentioning me!`);
    })
};