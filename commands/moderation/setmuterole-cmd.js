module.exports = (async(self,local)=>{
    if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");

    if(local.args[0] === "reset") {
        local.guild.channels.forEach(async(ch)=>{
            if(![null,undefined,""].includes(local.gConfig.muteRole) && ch.permissionOverwrites.has(local.gConfig.muteRole)) {
                if(ch.permissionOverwrites.get(local.gConfig.muteRole).allow.bitfield === 0 && ch.permissionOverwrites.get(local.gConfig.muteRole).deny.bitfield === 2048) {
                    await ch.permissionOverwrites.get(local.gConfig.muteRole).delete();
                } else {
                    await ch.permissionOverwrites.get(local.gConfig.muteRole).update({SEND_MESSAGES:null});
                }
            }
        })
        
        await self.db.updateGuild(local.guild.id,{muteRole:null});

        return local.message.reply("Reset channel overwrites and mute role.");
    }
    // role mention
    if(local.message.mentions.roles.first()) {
        var role = local.message.mentions.roles.first();
    }
    
    // role ID
    if(!isNaN(local.args[0]) && !(local.args.length === 0 || !local.args || local.message.mentions.roles.first())) {
        var user = local.guild.roles.get(local.args[0]);
    }
    
    // role name
    if(isNaN(local.args[0]) && local.args[0].indexOf("#") === -1 && !(local.args.length == 0 || !local.args || local.message.mentions.members.first())) {
        var role = local.guild.roles.find(r=>r.name==local.args.join(" "));
    }

    if(!role) {
        var data = {
            title: "Role not found",
            description: "The specified role was not found, please provide one of the following:\nFULL role ID, FULL role name (capitals do matter), or role mention",
            color: 15601937
        }
        Object.assign(data, local.embed_defaults("color"));
        var embed = new self.Discord.MessageEmbed(data);
        return local.channel.send(embed);
    }

    if(role.managed || role.rawPosition === 0 || role.rawPosition >= local.guild.me.roles.highest.rawPosition) {
        var data = {
            title: "Invalid Role",
            description: `This role (<@&${role.id}>) cannot be used as the muted role, check that is not any of these:\n\t- The guilds \`everyone\` role\n\t- A bots role (generated when a bot is invited)\n\t- Higher than me`,
            color: 15601937
        }
        Object.assign(data, local.embed_defaults("color"));
        var embed = new self.Discord.MessageEmbed(data);
        return local.channel.send(embed);
    }
    var g = await self.db.updateGuild(local.guild.id,{muteRole:role.id});
    if(!g) {
        local.message.reply("There was an internal error while doing this, please try again");
        return self.logger.log(g);
    }

    local.message.reply(`Set the new muted role to **${role.name}**`);

    local.guild.channels.forEach(async(ch)=>{
        if(![null,undefined,""].includes(local.gConfig.muteRole) && ch.permissionOverwrites.has(local.gConfig.muteRole)) {
            if(ch.permissionOverwrites.get(local.gConfig.muteRole).allow.bitfield === 0 && ch.permissionOverwrites.get(local.gConfig.muteRole).deny.bitfield === 2048) {
                await ch.permissionOverwrites.get(local.gConfig.muteRole).delete();
            } else {
                await ch.permissionOverwrites.get(local.gConfig.muteRole).update({SEND_MESSAGES:null});
            }
        }
        await ch.updateOverwrite(role,{SEND_MESSAGES:false});
    });
})