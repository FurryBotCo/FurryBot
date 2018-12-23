module.exports = {
	triggers: [
        "content"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Get the content count for the image types",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (self,local) => {
        var req = await self.request(`https://api.furrybot.me/image-counts.php`,{
            method: "GET"
        });
        var counts = JSON.parse(req.body);
        /*var txt = "";
        for(let key in counts) {
            txt+=`**${key}:**\n`;
            console.log(`key ${key}`);
            console.log(`counts[key] ${counts[key]}`);
            for(let key2 in counts[key]) {
                if(["array","obect"].includes(typeof counts[key][key2])) {
                    txt+=`${key2}\n`;
                    console.log(`counts[key][key2] ${counts[key][key2]}`);
                    console.log(`key2 ${key2}`);
                    for(let key3 in counts[key][key2][key3]) {
                        txt+=`\t${key3}: ${counts[key][key2][key3]}\n`;
                        console.log(`key3 ${key3}`);
                        console.log(`counts[key][key2][key3] ${counts[key][key2][key3]}`);
                    }
                } else {
                    txt+=`\t${key2}: ${counts[key][key2]}\n`;
                    console.log(`key2 ${key2}`);
                    console.log(`counts[key][key2] ${counts[key][key2]}`);
                }
            }
        }*/
        
        var content = "";
        for(let category in counts) {
            content+=`**${category}**\n`;
            if(counts[category] instanceof Object) {
                for(let level1 in counts[category]) {
                    if(counts[category][level1] instanceof Object) {
                        content+=`${level1}:\n`;
                        for(let level2 in counts[category][level1]) {
                            content+=`\t${level2}: ${counts[category][level1][level2]}\n`;
                        }
                    } else {
                        content+=`${level1}: ${counts[category][level1]}\n`;
                    }
                }
            }
        }
        return local.channel.send(content);
    })
};