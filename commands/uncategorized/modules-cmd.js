module.exports = (async(self,local)=>{
    var data = {
        title: "Module Status",
        description: "Enabled/disabled modules on this server.",
        fields: [
            {
                name: "Fun Module",
                value: local.gConfig.funModuleEnabled ? "Enabled" : "Disabled",
                inline: true
            },{
                name: "Moderation Module",
                value: local.gConfig.moderationModuleEnabled ? "Enabled" : "Disabled",
                inline: true
            },{
                name: "Info Module",
                value: local.gConfig.infoModuleEnabled ? "Enabled" : "Disabled",
                inline: true
            },{
                name: "Miscellaneous Module",
                value: local.gConfig.miscModuleEnabled ? "Enabled" : "Disabled",
                inline: true
            },{
                name: "Utility Module",
                value: local.gConfig.utilityModuleEnabled ? "Enabled" : "Disabled",
                inline: true
            },{
                name: "NSFW Module",
                value: local.gConfig.nsfwModuleEnabled ? "Enabled" : "Disabled",
                inline: true
            },{
                name: "F Response",
                value: local.gConfig.fResponseEnabled ? "Enabled" : "Disabled",
                inline: true
            }
        ]
    }
    Object.assign(data,local.embed_defaults);
    var embed = new self.Discord.MessageEmbed(data);
    return local.channel.send(embed);
})