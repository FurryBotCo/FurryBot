module.exports = (async(self,channel)=>{
    if(!channel || !channel.guild || !["text","voice","category"].includes(channel.type)) return;
    var ev = "channelcreated";
    var gConfig = await self.db.getGuild(channel.guild.id);
    if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
    var logch = channel.guild.channels.get(gConfig.logging[ev].channel);
    if(!logch) return self.db.updateGuild({logging:{[ev]:{enabled:false,channel:null}}});
    switch(channel.type) {
        case "text":
            var typeText = ":pencil: Text";
            break;

        case "voice":
            var typeText = ":loudspeaker: Voice";
            break;

        case "category":
            var TypeText = "Category";
            break;
    }
    var data = {
        title: `:new: ${typeText} Channel Created`,
        author: {
            name: channel.guild.name,
            icon_url: channel.guild.iconURL()
        },
        fields: [
            {
                name: "Name",
                value: channel.name,
                inline: true
            },{
                name: "ID"
            }
        ]
    }

    switch(channel.type) {
        case "text":

            break;
    }
})