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
	run: (async function(message) {
    
        switch(message.gConfig.commandImages) {
            case true:
                this.db.updateGuild(message.guild.id, {commandImages: false});
                message.reply("Disabled command images.");
                break;
    
            case false:
            this.db.updateGuild(message.guild.id, {commandImages: true});
            message.reply("Enabled command images.");
                break;
        }
    })
};