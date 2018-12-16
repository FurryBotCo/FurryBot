module.exports = ((input="",rplc={},ext={})=>{
    if(!input) input = "";
    var after = input;
    if(rplc !== undefined) {
        if(rplc.author !== undefined) {
            if(typeof ext.noMention !== "undefined" && ext.noMention === true){
                if(input.indexOf("{author}") !== -1 ) after = after.replace(/{author}/g,rplc.author.username);
            } else {
                if(input.indexOf("{author}") !== -1 ) after = after.replace(/{author}/g,`<@!${rplc.author.id}>`);
            }
            if(input.indexOf("{author.id}") !== -1 ) after = after.replace(/{author.id}/g,rplc.author.id);
            if(rplc.author.user !== undefined) {
                if(input.indexOf("{author.tag}") !== -1 ) after = after.replace(/{author.tag}/g,rplc.user.tag);
                if(input.indexOf("{author.username}") !== -1 ) after = after.replace(/{author.username}/g,rplc.user.username);         //
                if(input.indexOf("{author.discriminator}") !== -1 ) after = after.replace(/{author.discriminator}/g,rplc.user.discriminator);
                if(input.indexOf("{author.status}") !== -1 ) after = after.replace(/{author.status}/g,rplc.user.presence.status);
            }
        }
        if(rplc.user !== undefined) {
            if(typeof ext.noMention !== "undefined" && ext.noMention === true) {
                if(input.indexOf("{user}") !== -1 ) after = after.replace(/{user}/g,rplc.user.username);
            } else {
                if(input.indexOf("{user}") !== -1 ) after = after.replace(/{user}/g,`<@!${rplc.user.id}>`);
            }
            if(input.indexOf("{user.id}") !== -1 ) after = after.replace(/{user.id}/g,rplc.user.id);
            if(rplc.user.user !== undefined) {
                if(input.indexOf("{user.tag}") !== -1 ) after = after.replace(/{user.tag}/g,rplc.user.tag);
                if(input.indexOf("{user.username}") !== -1 ) after = after.replace(/{user.username}/g,rplc.user.username);
                if(input.indexOf("{user.discriminator}") !== -1 ) after = after.replace(/{user.discriminator}/g,rplc.user.discriminator);
                if(input.indexOf("{user.status}") !== -1 ) after = after.replace(/{user.status}/g,rplc.user.presence.status);
            }
        }
        if(rplc.guild !== undefined) {
            if(input.indexOf("{server}") !== -1) after = after.replace(/{server}/g,rplc.guild.name);
            if(input.indexOf("{server.id}") !== -1) after = after.replace(/{server.id}/g,rplc.guild.id);
            if(input.indexOf("{server.memberCount}") !== -1) after = after.replace(/{server.memberCount}/g,rplc.guild.memberCount);
            if(rplc.guild.members !== undefined) {
                if(input.indexOf("{server.onlineCount}") !== -1) after = after.replace(/{server.onlineCount}/g,rplc.guild.members.filter(m=>m.user.presence.status==="online").size);
                if(input.indexOf("{server.idleCount}") !== -1) after = after.replace(/{server.offlineCount}/g,rplc.guild.members.filter(m=>m.user.presence.status==="idle").size);
                if(input.indexOf("{server.dndCount}") !== -1) after = after.replace(/{server.dndCount}/g,rplc.guild.members.filter(m=>m.user.presence.status==="dnd").size);
                if(input.indexOf("{server.offlineCount}") !== -1) after = after.replace(/{server.offlineCount}/g,rplc.guild.members.filter(m=>m.user.presence.status==="offline").size);
            }
        }
        if(typeof ext.noMention !== "undefined" && ext.noMention === true) {
            //*
        } else {
            if(rplc.input !== undefined && input.indexOf("{input}") !== -1) after = after.replace(/{input}/g,rplc.input);
        }
        if(rplc.count !== undefined && input.indexOf("{count}") !== -1) after = after.replace(/{count}/g,rplc.count);
        if(rplc.prefix !== undefined && input.indexOf("{prefix}") !== -1) after = after.replace(/{prefix}/g,rplc.prefix);
    }
    return after;
});