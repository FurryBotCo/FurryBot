module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => {
    var a = require(`${__dirname}/${c}`);
    Object.assign(a,{
      path:`/${c}`,
      category: __dirname.split("\\").reverse()[0]
    })
    delete require.cache[require.resolve(`${__dirname}/${c}`)];
    return a;
  }),
  name: "Custom",
  description: "Custom commands for the bots main server only.",
  path: __dirname
};