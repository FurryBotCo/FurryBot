module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => require(`${__dirname}/${c}`)),
  name: "Info",
  description: "Some information that may be useful to you, may not be. I don't know."
};
