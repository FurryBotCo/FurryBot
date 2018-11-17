module.exports = (async(self,local)=>{
    Object.assign(self,local);
    if(!self.member.voice.channel) return self.message.reply("You must be in a voice channel.");
    if(self.args.length === 0) return self.message.reply("Please provide a query or youtube url.");
    if(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(self.args[0])) {
        var t = (await self.getSong(self.args[0])).tracks;
        if(t.length === 0) return self.message.reply("Nothing was found!");
        var song = t[0];
    } else {
        var t = (await self.songSearch(self.args.join(" "),"youtube")).tracks;
        if(t.length === 0) return self.message.reply("Nothing was found!");
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
            var song = await self.songMenu(pageNumber,pageCount,songs,self.message);
        } else {
            var song = songs.tracks[0];
        }
    }
    if(!song) return self.message.reply("Internal Error `play1`");
    if(song instanceof Error) {
        if(song.message == "CANCELED") return self.message.reply("Command canceled.");
        self.message.reply("Internal Error `play2`");
        console.error(err);
    }
    if(song instanceof self.Discord.Collection) return self.message.reply("Request timed out.");
    if(song instanceof Object) {
        if(!song.song) {
            if(typeof song.info !== "undefined") {
                song.song = {};
                song.song.info = song.info;
            } else {
                return self.message.reply("Internal Error `play3`");
            }
        }
        if(song.song.info.length > 6e5 && !self.gConfig.premium) return self.message.reply(`This is too long to be played! The maximum time for this guild is \`10 minutes (6000s)\, to increase this limit please donate, and mark this server as premium **${self.config.premiumLink}**.`); 
        if(!song.msg) {
            self.message.reply(`Now playing **${song.song.info.title}** by *${song.song.info.author}* - Length: ${Math.floor(song.song.info.length/1000/60)}m${song.song.info.length%60}s`);
        } else {
            
            song.msg.edit(`Now playing **${song.song.info.title}** by *${song.song.info.author}* - Length: ${Math.floor(song.song.info.length/1000/60)}m${song.song.info.length%60}s`);
        }
        var player = await self.playSong(self.member.voice.channel,song.song.info,"youtube");
    } else {
        self.message.reply(`Now playing **${song.info.title}** by *${song.info.author}* - Length: ${Math.floor(song.song.info.length/1000/60)}m${song.song.info.length%60}s`);
        var player = await self.playSong(self.member.voice.channel,song.info,"youtube");
    }
    console.log(song.song.info.length);
    player.on("finish",()=>{
        console.log("finished");
    });
});