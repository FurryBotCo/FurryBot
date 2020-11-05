/// <reference path="../@types/wolfram-alpha-node.d.ts" />
import config from "../../config";
import WolframAlpha from "wolfram-alpha-node";
const Wolfram = WolframAlpha(config.apis.wolframAlpha);
export default Wolfram;
