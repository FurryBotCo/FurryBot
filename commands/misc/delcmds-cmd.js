module.exports = (async (self,local) => {
    
    switch(local.gConfig.deleteCommands) {
        case true:
            self.db.updateGuild(local.guild.id, {deleteCommands: false});
            local.message.reply("Disabled deleting command invocations.");
            break;

        case false:
        self.db.updateGuild(local.guild.id, {deleteCommands: true});
        local.message.reply("Enabled deleting command invocations.");
            break;
    }
});