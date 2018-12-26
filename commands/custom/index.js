module.exports = {
    commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => require(`${__dirname}/${c}`)),
    name: "Custom",
    description: "Custom commands for the bots main server only."
  };