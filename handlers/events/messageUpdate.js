module.exports = (async function(oldMessage,newMessage) {
    if(!oldMessage || !newMessage || oldMessage.content === newMessage.content) return;
    try{
        require(`${this.config.rootDir}/handlers/events/message.js`)(newMessage);
    }catch(e){}
    if(!newMessage.guild || !["text","voice","category"].includes(newMessage.channel.type)) return;
    this.analytics.track({
        userId: "CLIENT",
        event: "client.events.messageUpdate",
        properties: {
            bot: {
                version: this.config.bot.version,
                beta: this.config.beta,
                alpha: this.config.alpha,
                server: this.os.hostname()
            }
        }
    });
    var ev = "messageupdated";
    var gConfig = await this.db.getGuild(newMessage.guild.id).catch(err=>this.config.defaultGuildSettings);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = newMessage.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return this.db.updateGuild(newMessage.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `Message Updated in ${newMessage.channel.name} (${newMessage.channel.id})`,
        author: {
            name: newMessage.guild.name,
            icon_url: newMessage.guild.iconURL()
        },
        timestamp: newMessage.createdTimestamp,
        color: this.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(newMessage.guild.shard) ? `${+newMessage.guild.shard.id+1}/${this.options.shardCount}`: "1/1"} | Bot Version ${this.config.bot.version}`
		},
        fields: [
            {
                name: "Old Message",
                value: oldMessage.content,
                inline: false
            },{
                name: "New Message",
                value: newMessage.content,
                inline: false
            },{
                name: "ID",
                value: newMessage.id,
                inline: false
            },{
                name: "Author",
                value: `${newMessage.author.tag} (${newMessage.author.id})`,
                inline: false
            }
        ]
    }
    var embed = new this.Discord.MessageEmbed(data);
    return logch.send(embed);
})