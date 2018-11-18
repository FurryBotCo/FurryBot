module.exports = (async(self)=>{
    self.logger.debug(`Close via Disconnect event`);
    process.exit();
})