import { Trello as TClient } from "trello-helper";
import config from "../config";
process.env.trelloHelper = JSON.stringify({
	appKey: config.apis.trello.appKey,
	token: config.apis.trello.token
});
const Trello = new TClient({
	useExistingEnvVar: true
});

export default Trello;
