import ClientEvent from "@modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "@config";
import { O_NOCTTY } from "constants";
import functions from "@util/functions";

export default new ClientEvent("guildDelete", (async function (this: FurryBot, guild: Eris.Guild) {

    let author = {
        name: "Unknown#0000",
        icon_url: "https://reddit.furry.host/noicon.png"
    };
    let owner = "Unknown#0000 (000000000000000000)";
    if (guild.ownerID) {
        let u: Eris.User = await this.getRESTUser(guild.ownerID).catch(err => null);
        if (u !== null) {
            author = {
                name: `${u.username}#${u.discriminator}`,
                icon_url: u.avatarURL ? u.avatarURL : "https://reddit.furry.host/noicon.png"
            };
            owner = `${u.username}#${u.discriminator} (${u.id})`;
        }
    }

    this.logger.info(`Left guild ${guild.name} (${guild.id}), owner: ${owner}, this guild had ${guild.memberCount} members.`);

    let embed: Eris.EmbedOptions = {
        title: "Guild Left!",
        description: `Guild #${this.guilds.size + 1}\nCurrent Total: ${this.guilds.size}`,
        author,
        image: {
            url: ![undefined, null, ""].includes(guild.iconURL) ? guild.iconURL : "https://reddit.furry.host/noicon.png"
        },
        thumbnail: {
            url: "https://reddit.furry.host/noicon.png"
        },
        fields: [
            {
                name: "Name",
                value: `${guild.name} (${guild.id})`,
                inline: false
            },
            {
                name: "Members",
                value: `Total: ${guild.memberCount}\n\n\
                <:online:590067324837691401>: ${guild.members.filter(m => m.status === "online").length}\n\
                <:idle:590067351806803968>: ${guild.members.filter(m => m.status === "idle").length}\n\
                <:dnd:590067389782032384>: ${guild.members.filter(m => m.status === "dnd").length}\n\
                <:offline:590067411080970241>: ${guild.members.filter(m => m.status === "offline").length}\n\n\
                Humans: ${guild.members.filter(m => !m.user.bot).length}\n
                Bots: ${guild.members.filter(m => m.user.bot).length}`,
                inline: false
            },
            {
                name: `Large Guild (${this.options.largeThreshold}+ Members)`,
                value: guild.large ? `Yes (${guild.memberCount})` : `No ${guild.memberCount}`,
                inline: false
            },
            {
                name: "Guild Owner",
                value: owner,
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        color: functions.randomColor(),
        footer: {
            text: `Shard ${guild.shard.id + 1}/${this.shards.size}`,
            icon_url: "https://reddit.furry.host/FurryBotForDiscord.png"
        }
    };

    if (embed.author.icon_url) embed.thumbnail.url = embed.author.icon_url;

    return this.executeWebhook(config.webhooks.guilds.id, config.webhooks.guilds.token, {
        embeds: [
            embed
        ],
        username: `FurryBot Bot Guild Stats${config.beta ? " - Beta" : ""}`,
        avatarURL: "https://reddit.furry.host/FurryBotForDiscord.png"
    });
}));