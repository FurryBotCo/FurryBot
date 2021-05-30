import config from "../../config";
import Sagiri from "sagiri";
const SauceNAO = Sagiri(config.apis.saucenao, {
	mask: [28],
	results: 4
});
export default SauceNAO;
