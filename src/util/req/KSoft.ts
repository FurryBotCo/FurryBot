import { KSoftClient } from "ksoft.js";
import config from "../../config";
const KSoft = new KSoftClient(config.apis.ksoft.v1);

export default KSoft;
