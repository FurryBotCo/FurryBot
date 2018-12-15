module.exports = (async (self,local) => {
    
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
});