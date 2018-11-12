module.exports = (async(self)=>{
    const config = require("../config");
    const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    const guilds = self.shard !== null ? await self.shard.fetchClientValues("guilds.size").then((res)=>{return res.reduce((prev, val) => prev + val, 0)}) : self.guilds.size,
        users = self.shard !== null ? await self.shard.fetchClientValues("users.size").then((res)=>{return res.reduce((prev, val) => prev + val, 0)}) : self.users.size,
        voice = self.shard !== null ? await self.shard.fetchClientValues("voiceConnections.size").then((res)=>{return res.reduce((prev, val) => prev + val, 0)}) : self.voiceConnections.size,
        shards = self.shard !== null ? self.shard.count : 1;
    for(let key in self.config.botLists) {
        if(self.config.botLists[key].alt !== undefined) {
            switch(self.config.botLists[key].alt) {
                case 1:
                    var xhr = new self.XMLHttpRequest();
                    xhr.open("POST",self.config.botLists[key].url,false);
                    xhr.setRequestHeader("Authorization", `Bot ${self.config.botLists[key].token}`);
                    xhr.setRequestHeader("Content-Type", "application/json");

                    xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        //console.log(`${key}:\n${this.responseText}\n---\n`);
                        if(this.status >= 200 && this.status < 400) {
                            console.log(`Successfully posted to ${self.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        } else {
                            console.error(`Error posting to ${self.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        }
                    }
                    });
                        
                    xhr.send(JSON.stringify({"server_count": guilds,users: users, voice_connections: voice}));
                    break;
                
                case 2:
                    var xhr = new self.XMLHttpRequest();
                    xhr.open("POST",self.config.botLists[key].url,false);
                    xhr.setRequestHeader("Authorization", `Bot ${self.config.botLists[key].token}`);
                    xhr.setRequestHeader("Content-Type", "application/json");

                    xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        //console.log(`${key}:\n${this.responseText}\n---\n`);
                        if(this.status >= 200 && this.status < 400) {
                            console.log(`Successfully posted to ${self.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        } else {
                            console.error(`Error posting to ${self.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        }
                    }
                    });
                        
                    xhr.send(JSON.stringify({"guilds": guilds,shards: shards}));
                    break;
            }
        } else {
            var xhr = new self.XMLHttpRequest();
            xhr.open("POST",self.config.botLists[key].url,false);
            xhr.setRequestHeader("Authorization", self.config.botLists[key].token);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                //console.log(`${key}:\n${this.responseText}\n---\n`);
                if(this.status >= 200 && this.status < 400) {
                    console.log(`Successfully posted to ${self.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                } else {
                    console.error(`Error posting to ${self.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                }
            }
            });
                
            xhr.send(JSON.stringify({server_count:guilds,key:self.config.botLists[key].token,guilds:guilds,guilds}));
        }
    }

    return {guilds,users,voice,shards};
});