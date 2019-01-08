module.exports = (async(client,oldUser,newUser) => {
    if(!oldUser || !newUser) return;
    var ev = "memberupdated";
    var base = {
        title: `Member Updated`,
        author: {
            name: `${newUser.tag} (${newUser.id})`,
            icon_url: newUser.avatarURL()
        },
        timestamp: new Date().toISOString(),
        color: client.randomColor(),
        fields: []
    }
    client.guilds.filter(g=>g.members.has(newUser.id)).forEach(async(guild)=>{
        var gConfig = await client.db.getGuild(guild.id).catch(err=>client.config.default.guildConfig);
        if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
        var logch = guild.channels.get(gConfig.logging[ev].channel);
        if(!logch) return client.db.updateGuild(guild.id,{logging:{[ev]:{enabled:false,channel:null}}});

        // username
        if(oldUser.username !== newUser.username) {
            var data = Object.assign({  
                footer: {
                    text: guild.name,
                    icon_url: guild.iconURL()
		        }
            },base);

            data.fields = [{
                name: "Old Username",
                value: oldUser.username,
                inline: false
            },{
                name: "New Username",
                value: newUser.username,
                inline: false
            }];

            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }

        // discriminator
        if(oldUser.discriminator !== newUser.discriminator) {
            var data = Object.assign({  
                footer: {
                    text: guild.name,
                    icon_url: guild.iconURL()
		        }
            },base);

            data.fields = [{
                name: "Old Discriminator",
                value: oldUser.discriminator,
                inline: false
            },{
                name: "New Discriminator",
                value: newUser.discriminator,
                inline: false
            }];
            
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }

        // avatar
        if(oldUser.displayAvatarURL() !== newUser.displayAvatarURL()) {
            var data = Object.assign({  
                footer: {
                    text: guild.name,
                    icon_url: guild.iconURL()
		        }
            },base);

            data.fields = [{
                name: "Old Avatar",
                value: oldUser.displayAvatarURL(),
                inline: false
            },{
                name: "New Avatar",
                value: newUser.displayAvatarURL(),
                inline: false
            }];
            
            var embed = new client.Discord.MessageEmbed(data);
            logch.send(embed);
        }
    });
});