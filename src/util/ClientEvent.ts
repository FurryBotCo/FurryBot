import * as Eris from "eris";
import FurryBot from "../main";

class ClientEvent<C extends Eris.Client = FurryBot> {
	event: string;
	listener: (this: C, ...args: any[]) => any;
	constructor(event: "ready" | "disconnect", listener: (this: C) => void);
	constructor(event: "callCreate" | "callRing" | "callDelete", listener: (this: C, call: Eris.Call) => void);
	constructor(event: "callUpdate", listener: (this: C, call: Eris.Call, oldCall: Eris.OldCall) => void);
	constructor(event: "channelCreate" | "channelDelete", listener: (this: C, channel: Eris.AnyChannel) => void);
	constructor(
		event: "channelPinUpdate",
		listener: (this: C, channel: Eris.TextableChannel, timestamp: number, oldTimestamp: number) => void
	);
	constructor(
		event: "channelRecipientAdd" | "channelRecipientRemove",
		listener: (this: C, channel: Eris.GroupChannel, user: Eris.User) => void
	);
	constructor(event: "channelUpdate", listener: (this: C, channel: Eris.AnyGuildChannel, oldChannel: Eris.OldGuildChannel) => void);
	constructor(event: "friendSuggestionCreate", listener: (this: C, user: Eris.User, reasons: Eris.FriendSuggestionReasons) => void);
	constructor(event: "friendSuggestionDelete", listener: (this: C, user: Eris.User) => void);
	constructor(event: "guildAvailable" | "guildBanAdd" | "guildBanRemove", listener: (this: C, guild: Eris.Guild, user: Eris.User) => void);
	constructor(event: "guildDelete" | "guildUnavailable" | "guildCreate", listener: (this: C, guild: Eris.Guild) => void);
	constructor(event: "guildEmojisUpdate", listener: (this: C, guild: Eris.Guild, emojis: Eris.Emoji[], oldEmojis: Eris.Emoji[]) => void);
	constructor(event: "guildMemberAdd", listener: (this: C, guild: Eris.Guild, member: Eris.Member) => void);
	constructor(event: "guildMemberChunk", listener: (this: C, guild: Eris.Guild, members: Eris.Member[]) => void);
	constructor(event: "guildMemberRemove", listener: (this: C, guild: Eris.Guild, member: Eris.Member | Eris.MemberPartial) => void);
	constructor(
		event: "guildMemberUpdate",
		listener: (this: C, guild: Eris.Guild, member: Eris.Member, oldMember: { roles: string[]; nick?: string }) => void
	);
	constructor(event: "guildRoleCreate" | "guildRoleDelete", listener: (this: C, guild: Eris.Guild, role: Eris.Role) => void);
	constructor(event: "guildRoleUpdate", listener: (this: C, guild: Eris.Guild, role: Eris.Role, oldRole: Eris.OldRole) => void);
	constructor(event: "guildUpdate", listener: (this: C, guild: Eris.Guild, oldGuild: Eris.OldGuild) => void);
	constructor(event: "hello", listener: (this: C, trace: string[], id: number) => void);
	constructor(event: "inviteCreate" | "inviteDelete", listener: (this: C, guild: Eris.Guild, invite: Eris.GuildInvite) => void);
	constructor(event: "messageCreate", listener: (this: C, message: Eris.Message) => void);
	constructor(event: "messageDelete" | "messageReactionRemoveAll", listener: (this: C, message: Eris.PossiblyUncachedMessage) => void);
	constructor(event: "messageReactionRemoveEmoji", listener: (this: C, message: Eris.PossiblyUncachedMessage, emoji: Eris.PartialEmoji) => void);
	constructor(event: "messageDeleteBulk", listener: (this: C, messages: Eris.PossiblyUncachedMessage[]) => void);
	constructor(
		event: "messageReactionAdd" | "messageReactionRemove",
		listener: (this: C, message: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userID: string) => void
	);
	constructor(event: "messageUpdate", listener: (this: C, message: Eris.Message, oldMessage?: Eris.OldMessage) => void
	);
	constructor(event: "presenceUpdate", listener: (this: C, other: Eris.Member | Eris.Relationship, oldPresence?: Eris.Presence) => void);
	constructor(event: "rawREST", listener: (this: C, request: Eris.RawRESTRequest) => void);
	constructor(event: "rawWS" | "unknown", listener: (this: C, packet: Eris.RawPacket, id: number) => void);
	constructor(event: "relationshipAdd" | "relationshipRemove", listener: (this: C, relationship: Eris.Relationship) => void);
	constructor(
		event: "relationshipUpdate",
		listener: (this: C, relationship: Eris.Relationship, oldRelationship: { type: number }) => void
	);
	constructor(event: "typingStart", listener: (this: C, channel: Eris.TextableChannel, user: Eris.User) => void);
	constructor(event: "unavailableGuildCreate", listener: (this: C, guild: Eris.UnavailableGuild) => void);
	constructor(
		event: "userUpdate",
		listener: (this: C, user: Eris.User, oldUser: { username: string; discriminator: string; avatar?: string }) => void
	);
	constructor(event: "voiceChannelJoin", listener: (this: C, member: Eris.Member, newChannel: Eris.VoiceChannel) => void);
	constructor(event: "voiceChannelLeave", listener: (this: C, member: Eris.Member, oldChannel: Eris.VoiceChannel) => void);
	constructor(
		event: "voiceChannelSwitch",
		listener: (this: C, member: Eris.Member, newChannel: Eris.VoiceChannel, oldChannel: Eris.VoiceChannel) => void
	);
	constructor(event: "voiceStateUpdate", listener: (this: C, member: Eris.Member, oldState: Eris.OldVoiceState) => void);
	constructor(event: "warn" | "debug", listener: (this: C, message: string, id: number) => void);
	constructor(
		event: "shardDisconnect" | "error" | "shardPreReady" | "connect",
		listener: (err: Error, id: number) => void
	);
	constructor(event: "shardReady" | "shardResume", listener: (id: number) => void);
	constructor(event: string, listener: (this: C, ...args: any[]) => any) {
		this.event = event;
		this.listener = listener;
	}
}

export default ClientEvent;
