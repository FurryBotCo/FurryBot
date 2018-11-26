module.exports = (async(self,local)=>{
    var l = "";
    var updateFields = {logging:{}};
    for(let key in local.gConfig.logging) {
        var log = local.gConfig.logging[key];
        if(log.enabled) {
            var s = local.guild.channels.get(log.channel);
            if(!s) {
                updateFields.logging[key] = {
                    channel: null,
                    enabled: false
                }
                var c = "Disabled (Invalid Channel)";
            } else {
                var c = `<#${s.id}>`;
            }
        } else {
            var c = "Not Enabled";
        }
        l+=`**${key}** - ${c}\n`;
    }
    var data = {
        title: "Server Logging Settings",
        description: `You can change these with \`${local.gConfig.prefix}log <enable/disable> <event>\`\n${l}`
    }
    Object.assign(data,local.embed_defaults());
    var embed = new self.Discord.MessageEmbed(data);
    return local.channel.send(embed);
})