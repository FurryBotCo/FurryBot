module.exports = {
	triggers: [
        "logevents"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 1e3,
	description: "List the loggable events, and their current state",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        var l = "";
        var updateFields = {logging:{}};
        for(let key in message.gConfig.logging) {
            var log = message.gConfig.logging[key];
            if(log.enabled) {
                var s = message.guild.channels.get(log.channel);
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
            description: `You can change these with \`${message.gConfig.prefix}log <enable/disable> <event>\`\n${l}`
        }
        Object.assign(data,message.embed_defaults());
        var embed = new this.Discord.MessageEmbed(data);
        return message.channel.send(embed);
    })
};