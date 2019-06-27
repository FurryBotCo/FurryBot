class CommandCreateError extends TypeError {
    constructor(message?: string) {
        super(message);

        this.name = "CommandError";
    }
}

export default CommandCreateError;