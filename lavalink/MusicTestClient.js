const config = require("../config");
const Discord = require("discord.js");
const { inspect } = require("util");
const request = require("async-request");
const chunk = require("chunk");
const ytdl = require("ytdl-core");


const client = new Discord.Client({disableEveryone:true});

client.login(config.bot.token);

client.on("ready", async()=>{
    console.log("ready");
});

client.on("message", async (message)=>{
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(config.defaultPrefix)) return;
    var args = message.content.slice(config.defaultPrefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase();

    switch(command) {
        case "play":
            self={};
            if(!message.member.voice.channel) return message.reply("You must be in a voice channel.");
            var tracks = (await songSearch(args.join(" "),"youtube")).tracks;
            if(tracks.length === 0) return message.reply("Nothing was found!");
            if(tracks.length > 1) {
                var rt = chunk(tracks,10);
                for(let key in rt) {
                    var l = rt[key].map((t,i)=>`${i+1} - **${t.info.title}** by *${t.info.author}*`);
                    rt[key] = l;
                }
                var pageCount = rt.length;
                async function playSong(channel,song,platform) {
                    return new Promise(async(resolve,reject)=>{
                        channel.join().catch((e)=>{
                            reject(e);
                        }).then(async(ch)=>{
                            switch(platform) {
                                case "youtube":
                                    try {
                                        resolve(ch.play(ytdl(song.uri, { quality: 'highestaudio' })));
                                    }catch(err){
                                        ch.disconnect().then(()=>{
                                            channel.leave()
                                        }).then(()=>{
                                            reject(err);
                                        });
                                    }
                                    break;

                                default:
                                    reject("invalid platform");
                            }
                        })
                    });
                }

                async function songMenu(pageNumber,msg) {
                    if(typeof self.ma !== "undefined" && typeof self.mb !== "undefined") {
                        self.ma.edit(`Multiple songs found, please specify the number you would like to play\n\n${rt[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}`);
                    } else {
                        var mid = await msg.channel.send(`Multiple songs found, please specify the number you would like to play\n\n${rt[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}`);
                        self.ma = mid;
                        self.mb = msg;
                    }
                    self.ma.channel.awaitMessages(m=>m.author.id === self.mb.author.id,{max:1,time: 1e4,errors:["time"]}).then(async(m)=>{
                        var res = rt[pageNumber];
                        var resultCount = rt.length;
                        var s = m.first().content.split(" ");
                        if(s[0] === "cancel") throw new Error("CANCEL");
                        if(s[0] === "page") {
                            if(pageNumber === s[1]) {
                                m.first().reply("You are already on that page.");
                                songMenu(pageNumber,m);
                            }
                            if(pageCount - s[1] < 0) {
                                m.first().reply("Invalid page!");
                                songMenu(pageNumber,m);
                            }  else {
                                songMenu(s[1],m);
                            }
                        } else {
                            if(resultCount.length < s[0]) {
                                m.first().reply("Invalid Selection!");
                                songMenu(pageNumber,m);
                            } else {
                                var song = tracks[pageNumber * 10 - Math.abs(s[0]-10) - 1];
                                console.log(song);
                                console.log(tracks.length);
                                console.log(pageNumber * 10 - Math.abs(s[0]-10) - 1);
                                m.first().reply(`now playing **${song.info.title}** by *${song.info.author}*`);
                                var player = await playSong(m.first().member.voice.channel,song.info,"youtube");
                                player.on("finish",()=>{
                                    console.log("finished");
                                })
                            }
                        }
                    }).catch((err)=>{
                        if(err instanceof Discord.Collection) {
                            return message.channel.send("Request timed out.");
                        } else {
                            if(err.message === "CANCEL") return message.reply("Command canceled.");
                            message.reply("Sorry, there was an error while doing this! Please try again later.");
                            console.error(err);
                        }
                    });
                }
                songMenu(1,message);
            } else {
                var song = tracks[0];
            }
            //console.log(song);
            //return message.reply(`Now playing: **${song.info.title}** by *${song.info.author}*`);
            break;

        case "stop":
        case "leave":
            var c = client.voiceConnections.filter(g=>g.channel.guild.id===message.guild.id);
            if(c.size === 0) return message.reply("Nothing is currently playing.");
            if(c.first().speaking.has("SPEAKING")) {
                c.first().disconnect()
                return message.reply("Ended playback and left the channel.");
            } else {
                c.first().channel.leave();
                return message.reply("Left the voice channel.");
            }
            break;

        case "pause":
            var c = client.voiceConnections.filter(g=>g.channel.guild.id===message.guild.id);
            if(c.size === 0) return message.reply("Please play something before using this!");
            if(!c.first().speaking.has("SPEAKING")) return message.reply("Nothing is playing.");
            if(c.first().dispatcher.paused) return message.reply("Player is already paused.");
            c.first().dispatcher.pause();
            return message.reply(":pause_button: **Paused**");
            break;

        case "resume":
        var c = client.voiceConnections.filter(g=>g.channel.guild.id===message.guild.id);
        if(c.size === 0) return message.reply("Please play something before using this!");
        if(c.first().speaking.has("SPEAKING")) return message.reply("Player is not paused.");
        if(!c.first().dispatcher.paused) return message.reply("Player is not paused.");
        c.first().dispatcher.resume();
        return message.reply(":play_pause: **Resumed**");
            break;

        case "eval":
            if (message.author.id !== "242843345402069002") return;
            try {
                const code = args.join(" ");
                const evaled = eval(code);
                return message.channel.send(await clean(evaled), { code: "js" });
            } catch (err) {
                return message.channel.send(`\`ERROR\` \`\`\`js\n${await clean(err)}\n\`\`\``);
            }
            break;
    }
})
async function clean(text) {
    if (text instanceof Promise || (Boolean(text) && typeof text.then === "function" && typeof text.catch === "function")) text = await text;
    if (typeof text !== "string") text = inspect(text, { depth: 0, showHidden: false });
    text = text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
    return text;
}

async function getSong(string) {
    const res = await request(`http://${config.musicPlayer.restnode.host}:${config.musicPlayer.restnode.port}/loadtracks?identifier=${string}`,{
        headers: {
            Authorization: config.musicPlayer.restnode.secret
        }
    }).catch(err => {
            console.error(err);
            return null;
        });
    if (!res) throw "There was an error, try again";
    if (res.body.length === 0) throw `No tracks found`;
    return res.body;
}

async function songSearch(strSearch,platform="youtube") {
    switch(platform) {
        case "youtube":
            var res = await request(`http://${config.musicPlayer.restnode.host}:${config.musicPlayer.restnode.port}/loadtracks?identifier=ytsearch:${strSearch}`,{
                method: "GET",
                headers: {
                    Authorization: config.musicPlayer.restnode.secret
                }
            });
            return JSON.parse(res.body);
            break;
        
        default:
            throw new Error("Invalid platform");
    }
}

function getRegion(region) {
    region = region.replace("vip-", "");
    for (const key in config.musicPlayer.regions) {
        const nodes = musicplayer.nodes.filter(node => node.connected && node.region === key);
        if (!nodes) continue;
        for (const id of config.musicPlayer.regions[key]) {
            if (id === region || region.startsWith(id) || region.includes(id)) return key;
        }
    }
    return "us";
}

function getIdealHost(region) {
    region = getRegion(region);
    const foundNode = musicplayer.nodes.find(node => node.ready && node.region === region);
    if (foundNode) return foundNode.host;
    return musicplayer.nodes.first().host;
}

process.on("unhandledRejection", console.log)
    .on("error", console.error)
    .on("warn", console.warn);