module.exports = (async(self,info)=>{
    if(!self.logger) {
        console.debug(info);
    } else {
        self.logger.debug(info);
    }
})