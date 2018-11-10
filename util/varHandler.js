module.exports = ((input,rplc,ext={})=>{
	var after = input;
	if(rplc !== undefined) {
        if(rplc.author !== undefined) {
            if(typeof ext.noMention !== "undefined" && ext.noMention === true){
				if(input.indexOf("{author}") !== -1 ) after = after.replace("{author}",rplc.author.username);
			} else {
				if(input.indexOf("{author}") !== -1 ) after = after.replace("{author}",`<@!${rplc.author.id}>`);
			}
			if(input.indexOf("{author.id}") !== -1 ) after = after.replace("{author.id}",rplc.author.id);
			if(rplc.author.user !== undefined) {
				if(input.indexOf("{author.tag}") !== -1 ) after = after.replace("{author.tag}",rplc.user.tag);
				if(input.indexOf("{author.username}") !== -1 ) after = after.replace("{author.username}",rplc.user.username);         //
				if(input.indexOf("{author.discriminator}") !== -1 ) after = after.replace("{author.discriminator}",rplc.user.discriminator);
				if(input.indexOf("{author.status}") !== -1 ) after = after.replace("{author.status}",rplc.user.presence.status);
			}
        }
		if(rplc.user !== undefined) {
            if(typeof ext.noMention !== "undefined" && ext.noMention === true) {
				if(input.indexOf("{user}") !== -1 ) after = after.replace("{user}",rplc.user.username);
			} else {
				if(input.indexOf("{user}") !== -1 ) after = after.replace("{user}",`<@!${rplc.user.id}>`);
			}
			if(input.indexOf("{user.id}") !== -1 ) after = after.replace("{user.id}",rplc.user.id);
			if(rplc.user.user !== undefined) {
				if(input.indexOf("{user.tag}") !== -1 ) after = after.replace("{user.tag}",rplc.user.tag);
				if(input.indexOf("{user.username}") !== -1 ) after = after.replace("{user.username}",rplc.user.username);
				if(input.indexOf("{user.discriminator}") !== -1 ) after = after.replace("{user.discriminator}",rplc.user.discriminator);
				if(input.indexOf("{user.status}") !== -1 ) after = after.replace("{user.status}",rplc.user.presence.status);
			}
        }
        if(rplc.guild !== undefined) {
            if(input.indexOf("{server}") !== -1) after = after.replace("{server}",rplc.guild.name);
            if(input.indexOf("{server.id}") !== -1) after = after.replace("{server.id}",rplc.guild.id);
			if(input.indexOf("{server.memberCount}") !== -1) after = after.replace("{server.memberCount}",rplc.guild.memberCount);
			if(rplc.guild.members !== undefined) {
				if(input.indexOf("{server.onlineCount}") !== -1) after = after.replace("{server.onlineCount}",rplc.guild.members.filter(m=>m.user.presence.status=="online").size);
				if(input.indexOf("{server.idleCount}") !== -1) after = after.replace("{server.offlineCount}",rplc.guild.members.filter(m=>m.user.presence.status=="idle").size);
				if(input.indexOf("{server.dndCount}") !== -1) after = after.replace("{server.dndCount}",rplc.guild.members.filter(m=>m.user.presence.status=="dnd").size);
				if(input.indexOf("{server.offlineCount}") !== -1) after = after.replace("{server.offlineCount}",rplc.guild.members.filter(m=>m.user.presence.status=="offline").size);
            }
        }
		if(typeof ext.noMention !== "undefined" && ext.noMention === true) {
			//*
		} else {
			if(rplc.input !== undefined && input.indexOf("{input}") !== -1) after = after.replace("{input}",rplc.input);
		}
		if(rplc.count !== undefined && input.indexOf("{count}") !== -1) after = after.replace("{count}",rplc.count);
		if(rplc.prefix !== undefined && input.indexOf("{prefix}") !== -1) after = after.replace("{prefix}",rplc.prefix);
    }
	return after;
});