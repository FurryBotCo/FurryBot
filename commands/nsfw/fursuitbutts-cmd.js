const {
    config,
    functions,
    phin,
    Database: {
        MongoClient,
        mongo,
        mdb
    }
} = require("../../modules/CommandRequire");

module.exports = {
    triggers: [
        "fursuitbutts",
        "fursuitbutt"
    ],
    userPermissions: [],
    botPermissions: [
        "attachFiles" // 32768s
    ],
    cooldown: 3e3,
    description: "See some fursuit booties!",
    usage: "",
    hasSubCommands: functions.hasSubCmds(__dirname, __filename),
    subCommands: functions.subCmds(__dirname, __filename),
    nsfw: true,
    devOnly: false,
    betaOnly: false,
    guildOwnerOnly: false,
    path: __filename,
    run: (async function (message) {
        const sub = await functions.processSub(module.exports, message, this);
        if (sub !== "NOSUB") return sub;

        let img, short, extra;
        img = await phin({
            url: "https://api.fursuitbutts.com/butts",
            parse: "json"
        });

        if (img.statusCode !== 200) {
            this.logger.error(img);
            return message.channel.createMessage(`<@!${message.author.id}>, Unknown api error.`);
        }
        short = await this.shortenUrl(img.body.response.image);
        extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
        return message.channel.createMessage(`${extra}Short URL: <${short.link}>\n\nRequested By: ${message.author.username}#${message.author.discriminator}`, {
            file: await functions.getImageFromURL(img.body.response.image),
            name: img.body.response.name
        });
    })
};