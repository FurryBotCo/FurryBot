module.exports = (async (self,local) => {
    
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
});