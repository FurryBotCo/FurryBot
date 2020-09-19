import { FluxPointAPI } from "fluxpointapi";
import config from "../../config";

const FluxPoint = new FluxPointAPI(config.apis.fluxpoint, config.web.userAgent);
export default FluxPoint;
