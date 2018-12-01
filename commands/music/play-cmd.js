module.exports = (async(self,local)=>{
    local.channel.startTyping();
    if(!local.member.voice.channel) {
        local.message.reply("You must be in a voice channel.");
        return local.channel.stopTyping();
    }
    if(local.args.length === 0) {
        local.message.reply("Please provide a query or youtube url.");
        return local.channel.stopTyping();
    }
    if(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(local.args[0])) {
        var t = (await self.getSong(local.args[0])).tracks;
        if(t.length === 0) {
            local.message.reply("Nothing was found!");
            return local.channel.stopTyping();
        }
        var song = t[0];
    } else {
        var t = (await self.songSearch(local.args.join(" "),"youtube")).tracks;
        if(t.length === 0) {
            local.message.reply("Nothing was found!");
            return local.channel.stopTyping();
        }
        var songs={
            tracks: {

            },
            songs: {

            }
        };
        songs.tracks = t;
        if(t.length > 1) {
        songs.list = self.chunk(songs.tracks,10);
            for(let key in songs.list) {
                songs.list[key] = songs.list[key].map((t,i)=>`__**${i+1}**__ - **${t.info.title}** by *${t.info.author}* - Length: ${Math.floor(t.info.length/1000/60)}m${t.info.length/1000%60}s`);
            }
            var pageCount = songs.tracks.length;
            var pageNumber = 1;
            var song = await self.songMenu(pageNumber,pageCount,songs,local.message);
        } else {
            var song = songs.tracks[0];
        }
    }
    if(!song) return local.message.reply("Internal Error `play1`");
    if(song instanceof Error) {
        if(song.message === "CANCELED") {
            local.message.reply("Command canceled.");
            return local.channel.stopTyping();
        }
        local.message.reply("Internal Error `play2`");
        console.error(err);
    }
    if(song instanceof self.Discord.Collection) {
        local.message.reply("Request timed out.");
        return local.channel.stopTyping();
    }
    if(song instanceof Object) {
        if(!song.song) {
            if(typeof song.info !== "undefined") {
                song.song = {};
                song.song.info = song.info;
            } else {
                return local.message.reply("Internal Error `play3`");
            }
        }
        if(song.song.info.length > 6e5 && !local.gConfig.premium) {
            local.message.reply(`This is too long to be played! The maximum time for this guild is \`10 minutes (6000s)\, to increase this limit please donate, and mark this server as premium **${self.config.premiumLink}**.`);
            return local.channel.stopTyping();
        } 
        if(!song.msg) {
            local.message.reply(`Now playing **${song.song.info.title}** by *${song.song.info.author}* - Length: ${Math.floor(song.song.info.length/1000/60)}m${song.song.info.length%60}s`);
        } else {
            
            song.msg.edit(`Now playing **${song.song.info.title}** by *${song.song.info.author}* - Length: ${Math.floor(song.song.info.length/1000/60)}m${song.song.info.length%60}s`);
        }
        var player = await self.playSong(local.member.voice.channel,song.song.info,"youtube");
    } else {
        local.message.reply(`Now playing **${song.info.title}** by *${song.info.author}* - Length: ${Math.floor(song.song.info.length/1000/60)}m${song.song.info.length%60}s`);
        var player = await self.playSong(local.member.voice.channel,song.info,"youtube");
    }
    player.on("finish",()=>{
        console.log("finished");
    });
    return local.channel.stopTyping();
});