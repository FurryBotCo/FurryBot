module.exports = (async(client)=>{
    client.logger.debug(`Close via Disconnect event`);
    process.exit();
})