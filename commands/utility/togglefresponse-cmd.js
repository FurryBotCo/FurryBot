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
	run: (async (self,local) => {
    
        switch(local.gConfig.fResponseEnabled) {
            case true:
                self.db.updateGuild(local.guild.id, {fResponseEnabled: false});
                local.message.reply("Disabled f response.");
                break;
    
            case false:
            self.db.updateGuild(local.guild.id, {fModuleEnabled: true});
            local.message.reply("Enabled f response.");
                break;
        }
    })
};