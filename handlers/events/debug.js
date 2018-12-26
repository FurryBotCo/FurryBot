module.exports = (async(client,info)=>{
    if(!client.logger) {
        console.debug(info);
    } else {
        client.logger.debug(info);
    }
})