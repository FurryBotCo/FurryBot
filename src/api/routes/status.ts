import express from "express";
import config from "@config";
import client from "@root/index";

const app: express.Router = express.Router();

app.get("/", async (req, res) => res.status(200).json({
	success: true,
	clientStatus: client.guilds.get(config.bot.mainGuild).members.get(client.user.id).status
}));

export default app;