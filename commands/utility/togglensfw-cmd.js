module.exports = (async (self,local) => {
    Object.assign(self,local);
    // nsfwModuleEnabled
    switch(self.gConfig.nsfwModuleEnabled) {
        case true:
            self.db.updateGuild(self.guild.id, {nsfwModuleEnabled: false});
            self.message.reply("Disabled NSFW commands.");
            break;

        case false:
        self.db.updateGuild(self.guild.id, {nsfwModuleEnabled: true});
        self.message.reply("Enabled NSFW commands.");
            break;
    }
});