module.exports = (async (self,local) => {
    
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
});