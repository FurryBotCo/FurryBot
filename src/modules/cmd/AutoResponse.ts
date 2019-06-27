import ExtendedMessage from "../extended/ExtendedMessage";

class AutoResponse {
    triggers: string[];
    userPermissions: string[];
    botPermissions: string[];
    cooldown: number;
    run: (message: ExtendedMessage) => any;
    constructor(data: {
        triggers: string[];
        userPermissions: string[];
        botPermissions: string[];
        cooldown: number;
        run: (message: ExtendedMessage) => any;
    }) {
        this.triggers = data.triggers;
        this.userPermissions = data.userPermissions;
        this.botPermissions = data.botPermissions;
        this.cooldown = data.cooldown;
    }
}

module.exports = AutoResponse;
export default AutoResponse;