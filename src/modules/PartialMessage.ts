import * as Eris from "eris";

interface PartialMessage {
    attachments: Eris.Attachment[],
    embeds: Eris.Embed[],
    content: string,
    editedTimestamp?: number,
    mentionedBy?: any,
    tts: boolean,
    mentions: string[],
    roleMentions: string[],
    channelMentions: string[]
}

export default PartialMessage;