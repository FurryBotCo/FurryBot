module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => require(`${__dirname}/${c}`)),
  name: "NSFW",
  description: "That stuff your parents warned you about >~>"
};
