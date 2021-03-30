import config from "../../config";
import { KSoftClient } from "ksoft.js";
const KSoft = new KSoftClient(config.apis.ksoft.v1);

export default KSoft;
