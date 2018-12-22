module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => require(`${__dirname}/${c}`)),
  name: "Moderation",
  description: "Stomp down the server baddies with your ban hammer."
};
