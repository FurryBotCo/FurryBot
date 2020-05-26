import config from "../../config";
import FurryServicesAPI from "furry.services";

const FSAPI = new FurryServicesAPI(config.web.userAgent);

export default FSAPI;
