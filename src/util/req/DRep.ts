// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../@types/@drep-api.d.ts" />
import config from "../../config";
import { DRepClient } from "@drep/api";
// eslint-disable-next-line
const DRep = new DRepClient(config.apis.discordrep);
export default DRep;
