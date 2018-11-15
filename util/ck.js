const Logger = require("./loggerV3");
var j = {shard:{id:0},options:{shardCount:2}};
const logger = new Logger(j);
console = logger;
console.log("test");
var j = {shard:{id:1},options:{shardCount:3}};
console.log("ts");
console.log(console.shardCount);