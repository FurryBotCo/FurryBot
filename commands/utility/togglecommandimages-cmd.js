module.exports = {
	triggers: [
        "toggleimages",
        "togglecommandimages"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle images on fun commands",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (self,local) => {
    
        switch(local.gConfig.commandImages) {
            case true:
                self.db.updateGuild(local.guild.id, {commandImages: false});
                local.message.reply("Disabled command images.");
                break;
    
            case false:
            self.db.updateGuild(local.guild.id, {commandImages: true});
            local.message.reply("Enabled command images.");
                break;
        }
    })
};