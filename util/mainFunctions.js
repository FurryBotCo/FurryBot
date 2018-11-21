const Discord = require("discord.js");
class FurryBotFunctions extends Discord.Client {
    constructor(ClientOptions) {
        super(ClientOptions);
    }

    async imageAPIRequest (safe=true,category=null,json=true,filetype=null) {
        return new Promise(async(resolve, reject)=>{
            if(!self) var self = this;
            if([undefined,null,""].includes(json)) json = true;
            var s = await self.request(`https://api.furrybot.me/${safe?"sfw":"nsfw"}/${category?category.toLowerCase():safe?"hug":"bulge"}/${json?"json":"image"}${filetype?`/${filetype}`:""}`);
            try {
                var j = JSON.parse(s.body);
                resolve(j);
            } catch(e) {
                reject({error:e,response:s.body});
            }
        });
    }

    async download (url, filename) {
        return new Promise((resolve,reject)=>{
            if(!self) var self = this;
            self.request(url).pipe(self.fsn.createWriteStream(filename)).on('close', resolve)
        });
    }

    async reloadModules () {
        for(var key in require.cache){
            if(key.indexOf("\\node_modules") != -1){
                delete require.cache[key];
            }
        }
        console.debug("Reloaded all modules");
        return true;
    }

    async reloadCommands () {
        if(!self) var self = this;
        var resp = await self.request("https://api.furrybot.me/commands", {
                method: "GET",
                headers: {
                        Authorization: `Key ${self.config.apiKey}`
                }
        });
        var response = JSON.parse(resp.body);
        self.config.commandList = {fullList: response.return.fullList, all: response.return.all};
        self.config.commandList.all.forEach((command)=>{
                self.commandTimeout[command] = new Set();
        });
        self.debug("Command Timeouts & Command List reloaded");
    }

    async reloadAll() {
        if(!self) var self = this;
        self.reloadCommands();
        self.reloadModules();
    }

    async random (len=10,keyset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
        if(len > 500 && !self[self.config.overrides.random]) throw new Error("Cannot generate string of specified length, please set global override to override this.");
        let rand = ""
        for (var i = 0; i < len; i++)
        rand += keyset.charAt(Math.floor(Math.random() * keyset.length));

        return rand;
    }

    async shortenUrl (url) {
        if(!self) var self = this;
        self.r.tableList().then((list)=>{
            if(!list.includes("shorturl")) {
                self.r.tableCreate("shorturl");
                console.log(`[ShortURL]: Created Short URL table`);
            }
        });
        
        const create = (async(url)=>{
            var count = await self.r.table("shorturl").count();
            var c = count;
            if(c == 0) c = 1;
            //62 = 26 (a-z) + 26 (A-Z) + 10 (0-9)
            if(Number.isInteger(c/62)) c++;
            if(c < 5) c = c+Math.abs(c-5);
            var rand = self.random(Math.ceil(c));
            var createdTimestamp = Date.now();
            var created = new Date().toISOString();
            var a = await self.r.table("shorturl").insert({id:rand,url,imageNumber:count+1,createdTimestamp,created,length:c,link:`https://furry.services/r/${rand}`});
            if(a.errors === 1) {
                return create(url);
            } else {
                return {code:rand,url,link:`https://furry.services/r/${rand}`,new:true,imageNumber:count+1,createdTimestamp,created,length:c};
            }
        });

        var res = await self.r.table("shorturl").filter({url});
        
        switch(res.length) {
            case 0:
                // create
                return create(url);
                break;

            case 1:
                // return
                var a = res[0];
                return {code:a.id,url,link:`https://furry.services/r/${a.id}`,new:false};
                break;

            default:
                // delete & recreate
                console.log(`[ShortURL]: Duplicate records found, deleting`);
                self.r.table("shorturl").filter({url}).forEach((short)=>{
                    return self.r.table("shorturl").get(short("id")).delete();
                });
                return create(url);
        }
    }
    async deleteAll (table,database = "furrybot") {
        if(!self) var self = this;
        if(["rethinkdb"].includes(database)) throw new Error(`{code:2,error:"ERR_ILLEGAL_DB",description:"illegal database"}`);
        if(["guilds","users"].includes(table)) throw new Error(`{code:1,error:"ERR_ILLEGAL_TABLE",description:"illegal database"}`);
        var dbList = await self.r.dbList();
        if(!dbList.includes(database)) throw new Error(`{code:3,error:"ERR_INVALID_DB",description:"invalid database"}`);
        var tableList = await self.r.db(database).tableList();
        if(!tableList.includes(table)) throw new Error(`{code:4,error:"ERR_INVALID_TABLE",description:"invalid table"}`);
        return self.r.db(database).table(table).forEach((entry)=>{
            return self.r.db(database).table(table).get(entry("id")).delete();
        });
    }

    get clearTable() {return this.deleteAll}
    
    async getRegion (region) {
        if(!self) var self = this;
        region = region.replace("vip-", "");
        for (const key in self.config.musicPlayer.regions) {
            const nodes = self.config.musicPlayer.nodes.filter(node => node.connected && node.region === key);
            if (!nodes) continue;
            for (const id of self.config.musicPlayer.regions[key]) {
                if (id === region || region.startsWith(id) || region.includes(id)) return key;
            }
        }
        return "us";
    }

    async getIdealHost (region) {
        if(!self) var self = this;
        region = getRegion(region);
        const foundNode = self.config.musicPlayer.nodes.find(node => node.ready && node.region === region);
        if (foundNode) return foundNode.host;
        return self.config.musicPlayer.nodes.first().host;
    }

    async getSong (str) {
        if(!self) var self = this;
        const res = await self.request(`http://${self.config.restnode.host}:${self.config.restnode.port}/loadtracks`,{
            qs: {
                identifier: str
            },
            headers: {
                Authorization: self.config.restnode.password
            }
        }).catch(err => {
            console.error(err);
            return null;
        });
        if (!res) throw "There was an error, try again";
        if (res.body.length == 0) throw `No tracks found`;
        return JSON.parse(res.body);
    }

    async songSearch (strSearch,platform="youtube") {
        if(!self) var self = this;
        return new Promise(async(resolve,reject)=>{
            if(!strSearch) reject(new Error("Missing parameters"));
            switch(platform) {
                case "youtube":
                    var res = await self.request(`http://${self.config.musicPlayer.restnode.host}:${self.config.musicPlayer.restnode.port}/loadtracks?identifier=ytsearch:${strSearch}`,{
                        method: "GET",
                        headers: {
                            Authorization: self.config.musicPlayer.restnode.secret
                        }
                    });
                    resolve(JSON.parse(res.body));
                    break;
                
                default:
                    reject(new Error("Invalid platform"));
            }
        });
    }

    async playSong (channel,song,platform="youtube") {
        if(!self) var self = this;
        return new Promise(async(resolve,reject)=>{
            if(!channel || !song) reject(new Error("Missing parameters"));
        
            channel.join().catch((e)=>{
                reject(e);
            }).then(async(ch)=>{
                switch(platform) {
                    case "youtube":
                        try {
                            resolve(ch.play(self.ytdl(song.uri, { quality: 'highestaudio' })));
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

    async songMenu (pageNumber,pageCount,songs,msg,ma,mb) {
        if(!self) var self = this;
        return new Promise(async(resolve,reject)=>{
            if(!pageNumber || !pageCount || !songs || !msg) reject(new Error("missing parameters."));
            if(typeof ma !== "undefined" && typeof mb !== "undefined") {
                ma.edit(`Multiple songs found, please specify the number you would like to play\n\n${rt[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
            } else {
                var mid = await msg.channel.send(`Multiple songs found, please specify the number you would like to play\n\n${songs.list[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
                var ma = mid;
                var mb = msg;
            }
            ma.channel.awaitMessages(m=>m.author.id === mb.author.id,{max:1,time: 1e4,errors:["time"]}).then(async(m)=>{
                var res = songs.list[pageNumber];
                var resultCount = songs.list.length;
                var s = m.first().content.split(" ");
                if(s[0] === "cancel") throw new Error("CANCEL");
                if(s[0] === "page") {
                    if(pageNumber === s[1]) {
                        m.first().reply("You are already on that page.");
                        resolve(self.songMenu(pageNumber,pageCount,songs,msg,ma,mb));
                    }
                    if(pageCount - s[1] < 0) {
                        m.first().reply("Invalid page!");
                        resolve(self.songMenu(pageNumber,pageCount,songs,m,ma,mb));
                    }  else {
                        resolve(self.songMenu(s[1],pageCount,songs,m,ma,mb));
                    }
                } else {
                    if(resultCount.length < s[0]) {
                        m.first().reply("Invalid Selection!");
                        resolve(self.songMenu(pageNumber,pageCount,songs,m,ma,mb));
                    } else {
                        var song = songs.tracks[pageNumber * 10 - Math.abs(s[0]-10) - 1];
                        resolve({song,msg:ma});
                    }
                }
            }).catch(resolve);
        });
    }

    async getSong (strIdentifier) {
        if(!self) var self = this;
        return new Promise(async(resolve,reject)=>{
            if(!strIdentifier) reject(new Error("Missing parameters"));
            var res = await self.request(`http://${config.musicPlayer.restnode.host}:${config.musicPlayer.restnode.port}/loadtracks?identifier=${strIdentifier}`,{
                headers: {
                    Authorization: config.musicPlayer.restnode.secret
                }
            });
            if(res.body.length === 0) return resolve(res.body);
            return resolve(JSON.parse(res.body));
        })
    }

    async resolveUser(user) {
        if(!self) var self = this;
        if(user instanceof self.Discord.GuildMember) {
            // can check permissions
            var u = {
                isDeveloper: self.config.developers.includes(user.id),
                isServerModerator: user.permissions.has("MANAGE_GUILD"),
                isServerAdministrator: user.permissions.has("ADMINISTRATOR")
            }
        } else if (user instanceof self.Discord.User) {
            // only dev checking
            var u = {
                isDeveloper: self.config.developers.includes(user.id)
            }
        } else {
            throw new Error("Invalid user provided");
        }
        return u;
    }
}

module.exports = FurryBotFunctions;