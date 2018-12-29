module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => {
    var a = require(`${__dirname}/${c}`);
    Object.assign(a,{
      path:`${__dirname}/${c}`,
      category: __dirname.split("\\").reverse()[0]
    })
    delete require.cache[require.resolve(`${__dirname}/${c}`)];
    return a;
  }),
  name: "Music",
  description: "Chill with some nice vibes 'n' tunes.",
  path: __dirname
};
