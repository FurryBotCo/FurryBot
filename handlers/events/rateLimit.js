module.exports = (async(self,rl) => {
    self.warn(`Ratelimit: ${rl.method} ${rl.path} | Route: ${rl.route} | Timeout: ${rl.timeout}ms | Limit: ${rl.limit}`);
});