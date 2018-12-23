module.exports = {
	triggers: [
        "togglensfw"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle NSFW Commands",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (self,local) => {
    
        // nsfwModuleEnabled
        switch(local.gConfig.nsfwModuleEnabled) {
            case true:
                self.db.updateGuild(local.guild.id, {nsfwModuleEnabled: false});
                local.message.reply("Disabled NSFW commands.");
                break;
    
            case false:
            self.db.updateGuild(local.guild.id, {nsfwModuleEnabled: true});
            local.message.reply("Enabled NSFW commands.");
                break;
        }
    })
};