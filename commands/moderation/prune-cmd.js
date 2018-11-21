module.exports = (async(self,local)=>{
    if(local.args.length < 1 || isNaN(local.args[0])) return new Error("ERR_INVALID_USAGE");
    if(local.args[0] < 2 || local.args[0] > 100) return local.message.reply("Please provide a number between 2");
    local.message.delete().catch(noerr=>null);
    return local.channel.bulkDelete(local.args[0],true);
})