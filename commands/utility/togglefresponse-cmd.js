module.exports = {
	triggers: [
        "togglef",
        "togglerip",
        "togglefresponse",
        "toggleripresponse"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggles the \"f\" and \"rip\" responses",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
    
        switch(message.gConfig.fResponseEnabled) {
            case true:
                client.db.updateGuild(message.guild.id, {fResponseEnabled: false});
                message.reply("Disabled f response.");
                break;
    
            case false:
            client.db.updateGuild(message.guild.id, {fModuleEnabled: true});
            message.reply("Enabled f response.");
                break;
        }
    })
};