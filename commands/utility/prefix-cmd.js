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
	run: (async(self,local)=>{
        if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
        if(local.args[0].length < 1 || local.args[0].length > 30) return local.message.reply("Prefix must be between 1 and 30 characters.");
        await self.db.updateGuild(local.guild.id,{prefix:local.args[0].toLowerCase()});
        return local.message.reply(`Set this guilds prefix to ${local.args[0].toLowerCase()}, you can view the current prefix at any time by typing \`whatismyprefix\`, or mentioning me!`);
    })
};