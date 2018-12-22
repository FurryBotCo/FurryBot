module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => require(`${__dirname}/${c}`)),
  name: "Memes",
  description: "Let's get this bread."
};
