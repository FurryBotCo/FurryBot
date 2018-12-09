module.exports = (async (self,local) => {
    var req = await self.request(`https://api.furrybot.me/image-counts.php`,{
        method: "GET"
    });
    var counts = JSON.parse(req.body);
    var txt = "";
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
    }
    return local.channel.send(txt);
});