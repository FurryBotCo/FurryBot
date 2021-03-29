import config from "../../config";
import { FluxPointAPI } from "fluxpointapi";

const FluxPoint = new FluxPointAPI(config.apis.fluxpoint, config.web.userAgent); // eslint-disable-line
export default FluxPoint;
