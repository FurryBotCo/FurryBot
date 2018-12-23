const fs = require("fs"),
    path = require("path"),
    isDir = (sauce) => fs.lstatSync(sauce).isDirectory(),
    dirs = fs.readdirSync(__dirname).map(name => path.join(__dirname,name)).filter(isDir);
console.log(dirs)