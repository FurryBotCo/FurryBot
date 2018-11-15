module.exports = (async(self,local)=>{
    Object.assign(self,local);
    if (!self.member.voice.channel) return message.reply("You must be in a voice channel");
        track = args.join(" ");
        const [song] = await getSong(track);
        const player = await client.player.join({
            guild: self.guild.id,
            channel: self.member.voice.channel.id,
            host: self.getIdealHost(self.guild.region)
        }, { selfdeaf: true });
        if (!self.player) throw "No player found...";
        self.player.play(song.track);
        self.player.on("error", console.error);
        self.player.on("end", data => {
            if (data.reason === "REPLACED") return;
            self.channel.send("Song has ended...");
        });
        return message.reply(`Now playing: **${song.info.title}** by *${song.info.author}*`);
});