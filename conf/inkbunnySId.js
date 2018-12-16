module.exports = (()=>{
    if(fs.existsSync(`${module.exports.rootDir}/inkbunny-sid.txt`)) {
        return fs.readFileSync(`${module.exports.rootDir}/inkbunny-sid.txt`,"UTF8",(async(sid)=>{
            if(sid === "") sid = "nosid";
            var req = await request(`https://inkbunny.net/api_userrating.php?sid=${sid}`,{
                method: "GET"
            });
            var a = JSON.parse(req.body);
            if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                switch(a.error_code) {
                    case 2:
                        var login = await request(`https://inkbunny.net/api_login.php?${module.exports.apis.inkbunny.urlCredentials}`,{
                            method: "GET"
                        });
                        var b = JSON.parse(login.body);
                        if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
                            switch(b.error_code) {
                                case 0:
                                    console.error(`[Config][InkbunnyLogin]: Invalid Credentials`);
                                    break;
                
                                default:
                                    console.error(`[Config][InkbunnyLogin]: ${e}`);
                            }
                        } else {
                            await fsn.writeFile(`${module.exports.rootDir}/inkbunny-sid.txt`,b.sid);
                            console.log(`[Config][InkbunnyLogin]: Generated new SID`);
                            return b.sid;
                        }
                        break;
        
                    default:
                        console.error(`[Config][InkbunnyLogin]: ${util.inspect(a,{depth:null})}`);
                }
            } else {
                return a.sid;
            }
        }));
    } else {
        fs.writeFile(`${module.exports.rootDir}/inkbunny-sid.txt`,"",async()=>{
            var req = await request(`https://inkbunny.net/api_login.php?${module.exports.apis.inkbunny.urlCredentials}`,{
                method: "GET"
            });
            var a = JSON.parse(req.body);
            if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                switch(a.error_code) {
                    case 0:
                        console.error(`[Config][InkbunnyLogin]: Invalid Credentials`);
                        break;
    
                    default:
                        console.error(`[Config][InkbunnyLogin]: ${e}`);
                }
            } else {
                await fsn.writeFile(`${module.exports.rootDir}/inkbunny-sid.txt`,a.sid);
                console.log(`[Config][InkbunnyLogin]: Generated new SID`);
                return a.sid;
            }
        });
    }
    console.log(a);
    return a;
})