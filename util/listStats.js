module.exports = (async(client)=>{
    const guilds = client.guilds.size,
        users = client.users.size,
        voice = client.voiceConnections.size,
        shards = client.options.shardCount || 1;
    for(let key in client.config.botLists) {
        if(client.config.botLists[key].alt !== undefined) {
            switch(client.config.botLists[key].alt) {
                case 1:
                    var xhr = new client.XMLHttpRequest();
                    xhr.open("POST",client.config.botLists[key].url,false);
                    xhr.setRequestHeader("Authorization", `Bot ${client.config.botLists[key].token}`);
                    xhr.setRequestHeader("Content-Type", "application/json");

                    xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        //console.log(`${key}:\n${this.responseText}\n---\n`);
                        if(this.status >= 200 && this.status < 400) {
                            console.log(`Successfully posted to ${client.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        } else {
                            console.error(`Error posting to ${client.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        }
                    }
                    });
                        
                    xhr.send(JSON.stringify({"server_count": guilds,users: users, voice_connections: voice}));
                    break;
                
                case 2:
                    var xhr = new client.XMLHttpRequest();
                    xhr.open("POST",client.config.botLists[key].url,false);
                    xhr.setRequestHeader("Authorization", `Bot ${client.config.botLists[key].token}`);
                    xhr.setRequestHeader("Content-Type", "application/json");

                    xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        //console.log(`${key}:\n${this.responseText}\n---\n`);
                        if(this.status >= 200 && this.status < 400) {
                            console.log(`Successfully posted to ${client.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        } else {
                            console.error(`Error posting to ${client.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                        }
                    }
                    });
                        
                    xhr.send(JSON.stringify({"guilds": guilds,shards: shards}));
                    break;
            }
        } else {
            var xhr = new client.XMLHttpRequest();
            xhr.open("POST",client.config.botLists[key].url,false);
            xhr.setRequestHeader("Authorization", client.config.botLists[key].token);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                //console.log(`${key}:\n${this.responseText}\n---\n`);
                if(this.status >= 200 && this.status < 400) {
                    console.log(`Successfully posted to ${client.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                } else {
                    console.error(`Error posting to ${client.config.botLists[key].name} - status: ${this.status} - ${this.responseText}`);
                }
            }
            });
                
            xhr.send(JSON.stringify({server_count:guilds,key:client.config.botLists[key].token,guilds}));
        }
    }
    client.logger.log(`Posted Stats:\nguilds: ${guilds}\nusers: ${users}\nvoice connections: ${voice}\nshard count: ${shards}`);
    return {guilds,users,voice,shards};
});