module.exports = {
  commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => require(`${__dirname}/${c}`)),
  name: "Economy",
  description: "Money money money, blah blah blah."
};
