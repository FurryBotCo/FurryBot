module.exports = (async(client,message)=>{
    if(!message) return;
    if(!message.channel.guild || !["text","voice","category"].includes(message.channel.type)) return;
    var ev = "messagedeleted";
    var gConfig = await client.db.getGuild(message.guild.id).catch(err=>client.config.defaultGuildSettings);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = message.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return client.db.updateGuild(message.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
    var data = {
        title: `Message Deleted in ${message.channel.name} (${message.channel.id})`,
        author: {
            name: message.guild.name,
            icon_url: message.guild.iconURL()
        },
        timestamp: new Date().toISOString(),
        color: client.randomColor(),
        footer: {
			text: `Shard ${![undefined,null].includes(message.guild.shard) ? `${+message.guild.shard.id+1}/${client.options.shardCount}`: "1/1"} | Bot Version ${client.config.bot.version}`
		},
        fields: [
            {
                name: "Content",
                value: message.content,
                inline: false
            },{
                name: "ID",
                value: message.id,
                inline: false
            },{
                name: "Author",
                value: `${message.author.tag} (${message.author.id})`,
                inline: false
            }
        ]
    }
    var embed = new client.Discord.MessageEmbed(data);
    return logch.send(embed);
})