import { DRepClient } from "@drep/api";
import config from "../../config";
const DRep = new DRepClient(config.apis.discordrep);
export default DRep;
