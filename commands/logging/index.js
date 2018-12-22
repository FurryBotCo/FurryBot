module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => require(`${__dirname}/${c}`)),
  name: "Logging",
  description: "Keep track of what's happing in your server."
};
