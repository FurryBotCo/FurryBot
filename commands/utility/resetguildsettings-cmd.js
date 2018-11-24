module.exports = (async(self,local)=>{
    local.channel.send("This will erase ALL guild (server) settings, are you sure you want to do this?\nType **yes** or **no**.");
    local.channel.awaitMessages(m=>["yes","no"].includes(m.content.toLowerCase())&&m.author.id===local.author.id,{max:1,time:6e4,errors:["time"]}).then(async(m)=>{
            var choice = m.first().content.toLowerCase() === "yes" ? true : false;
            if(!choice) {
                return local.message.reply("Canceled reset.");
            } else {
                await local.message.reply(`All guild settings will be reset shortly.\n(note: prefix will be **${self.config.defaultPrefix}**)`);
                self.db.resetGuild(local.guild.id).catch((e)=>{
                    self.logger.error(e);
                    return local.channel.send("There was an internal error while doing this");
                });
            }
    }).catch((e)=>{
        if(e instanceof self.Discord.Collection) {
            return local.message.reply("Timed out.");
        } else {
            self.logger.error(e);
            return local.message.reply("An unknown error occured, please contact the bot owner.");
        }
    })
    return;
});