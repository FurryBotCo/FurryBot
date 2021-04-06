import config from "../../config";
import { Trello as TClient } from "trello-helper";
process.env.trelloHelper = JSON.stringify({
	appKey: config.apis.trello.appKey,
	token: config.apis.trello.token
});
const Trello = new TClient({
	useExistingEnvVar: true
});

export default Trello;
