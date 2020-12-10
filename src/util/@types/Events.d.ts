import Eris from "eris";
type Ready = () => void;
type Disconnect = () => void;

type CallCreate = (call: Eris.Call) => void;
type CallRing = (call: Eris.Call) => void;
type CallDelete = (call: Eris.Call) => void;

type CallUpdate = (call: Eris.Call, oldCall: Eris.OldCall) => void;

type ChannelCreate = (channel: Eris.AnyChannel) => void;
type ChannelDelete = (channel: Eris.AnyChannel) => void;

type ChannelPinUpdate = (channel: Eris.TextableChannel, timestamp: number, oldTimestamp: number) => void;

type ChannelRecipientAdd = (channel: Eris.GroupChannel, user: Eris.User) => void;
type ChannelRecipientRemove = (channel: Eris.GroupChannel, user: Eris.User) => void;

type ChannelUpdate = (channel: Eris.AnyGuildChannel, oldChannel: Eris.OldGuildChannel) => void;

type FriendSuggestionCreate = (user: Eris.User, reasons: Eris.FriendSuggestionReasons) => void;

type FriendSuggestionDelete = (user: Eris.User) => void;

type GuildAvailable = (guild: Eris.Guild, user: Eris.User) => void;
type GuildBanAdd = (guild: Eris.Guild, user: Eris.User) => void;
type GuildBanRemove = (guild: Eris.Guild, user: Eris.User) => void;

type GuildDelete = (guild: Eris.Guild) => void;
type GuildUnavailable = (guild: Eris.Guild) => void;
type GuildCreate = (guild: Eris.Guild) => void;

type GuildEmojisUpdate = (guild: Eris.Guild, emojis: Eris.Emoji[], oldEmojis: Eris.Emoji[]) => void;

type GuildMemberAdd = (guild: Eris.Guild, member: Eris.Member) => void;

type GuildMemberChunk = (guild: Eris.Guild, members: Eris.Member[]) => void;

type GuildMemberRemove = (guild: Eris.Guild, member: Eris.Member | Eris.MemberPartial) => void;

type GuildMemberUpdate = (guild: Eris.Guild, member: Eris.Member, oldMember: { roles: string[]; nick?: string; }) => void;

type GuildRoleCreate = (guild: Eris.Guild, role: Eris.Role) => void;
type GuildRoleDelete = (guild: Eris.Guild, role: Eris.Role) => void;

type GuildRoleUpdate = (guild: Eris.Guild, role: Eris.Role, oldRole: Eris.OldRole) => void;

type GuildUpdate = (guild: Eris.Guild, oldGuild: Eris.OldGuild) => void;

type Hello = (trace: string[], id: number) => void;

type InviteCreate = (guild: Eris.Guild, invite: Eris.Invite) => void;
type InviteDelete = (guild: Eris.Guild, invite: Eris.Invite) => void;

type MessageCreate = (message: Eris.Message) => void;

type MessageDelete = (message: Eris.PossiblyUncachedMessage) => void;
type MessageReactionRemoveAll = (message: Eris.PossiblyUncachedMessage) => void;

type MessageReactionRemoveEmoji = (message: Eris.PossiblyUncachedMessage, emoji: Eris.PartialEmoji) => void;

type MessageDeleteBulk = (messages: Eris.PossiblyUncachedMessage[]) => void;

type MessageReactionAdd = (message: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userID: string) => void;
type MessageReactionRemove = (message: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userID: string) => void;

type MessageUpdate = (message: Eris.Message, oldMessage?: Eris.OldMessage) => void;

type PresenceUpdate = (other: Eris.Member | Eris.Relationship, oldPresence?: Eris.Presence) => void;

type RawREST = (request: Eris.RawRESTRequest) => void;

type RawWS = (packet: Eris.RawPacket, id: number) => void;
type Unknown = (packet: Eris.RawPacket, id: number) => void;

type RelationshipAdd = (relationship: Eris.Relationship) => void;
type RelationshipRemove = (relationship: Eris.Relationship) => void;

type RelationshipUpdate = (relationship: Eris.Relationship, oldRelationship: { type: number; }) => void;

type TypingStart = (channel: Eris.TextableChannel, user: Eris.User) => void;

type UnavailableGuildCreate = (guild: Eris.UnavailableGuild) => void;

type UserUpdate = (user: Eris.User, oldUser: { username: string; discriminator: string; avatar?: string; }) => void;

type VoiceChannelJoin = (member: Eris.Member, newChannel: Eris.VoiceChannel) => void;

type VoiceChannelLeave = (member: Eris.Member, oldChannel: Eris.VoiceChannel) => void;

type VoiceChannelSwitch = (member: Eris.Member, newChannel: Eris.VoiceChannel, oldChannel: Eris.VoiceChannel) => void;

type VoiceStateUpdate = (member: Eris.Member, oldState: Eris.OldVoiceState) => void;

type Warn = (message: string, id: number) => void;
type Debug = (message: string, id: number) => void;

type ShardDisconnect = (err: Error, id: number) => void;
type Error = (err: Error, id: number) => void;
type ShardPreReady = (err: Error, id: number) => void;
type Connect = (err: Error, id: number) => void;

type ShardReady = (id: number) => void;
type ShardResume = (id: number) => void;


type WrapThis<F extends (...args: any[]) => any, C extends Eris.Client = Eris.Client> = (this: C, ...args: Parameters<F>) => ReturnType<F>;

declare global {

	interface ErisEventMap<C extends Eris.Client = Eris.Client> {
		ready: WrapThis<Ready, C>;
		disconnect: WrapThis<Disconnect, C>;
		callCreate: WrapThis<CallCreate, C>;
		callRing: WrapThis<CallRing, C>;
		callDelete: WrapThis<CallDelete, C>;
		callUpdate: WrapThis<CallUpdate, C>;
		channelCreate: WrapThis<ChannelCreate, C>;
		channelDelete: WrapThis<ChannelDelete, C>;
		channelPinUpdate: WrapThis<ChannelPinUpdate, C>;
		channelRecipientAdd: WrapThis<ChannelRecipientAdd, C>;
		channelRecipientRemove: WrapThis<ChannelRecipientRemove, C>;
		friendSuggestionCreate: WrapThis<FriendSuggestionCreate, C>;
		friendSuggestionDelete: WrapThis<FriendSuggestionDelete, C>;
		guildAvailable: WrapThis<GuildAvailable, C>;
		guildBanAdd: WrapThis<GuildBanAdd, C>;
		guildBanRemove: WrapThis<GuildBanRemove, C>;
		guildDelete: WrapThis<GuildDelete, C>;
		guildUnavailable: WrapThis<GuildUnavailable, C>;
		guildCreate: WrapThis<GuildCreate, C>;
		guildEmojisUpdate: WrapThis<GuildEmojisUpdate, C>;
		guildMemberAdd: WrapThis<GuildMemberAdd, C>;
		guildMemberChunk: WrapThis<GuildMemberChunk, C>;
		guildMemberRemove: WrapThis<GuildMemberRemove, C>;
		guildMemberUpdate: WrapThis<GuildMemberUpdate, C>;
		guildRoleCreate: WrapThis<GuildRoleCreate, C>;
		guildRoleDelete: WrapThis<GuildRoleDelete, C>;
		guildUpdate: WrapThis<GuildUpdate, C>;
		hello: WrapThis<Hello, C>;
		inviteCreate: WrapThis<InviteCreate, C>;
		inviteDelete: WrapThis<InviteDelete, C>;
		messageCreate: WrapThis<MessageCreate, C>;
		messageDelete: WrapThis<MessageDelete, C>;
		messageReactionRemoveAll: WrapThis<MessageReactionRemoveAll, C>;
		messageReactionRemoveEmoji: WrapThis<MessageReactionRemoveEmoji, C>;
		messageDeleteBulk: WrapThis<MessageDeleteBulk, C>;
		messageReactionAdd: WrapThis<MessageReactionAdd, C>;
		messageReactionRemove: WrapThis<MessageReactionRemove, C>;
		messageUpdate: WrapThis<MessageUpdate, C>;
		presenceUpdate: WrapThis<PresenceUpdate, C>;
		rawREST: WrapThis<RawREST, C>;
		rawWS: WrapThis<RawWS, C>;
		unknown: WrapThis<Unknown, C>;
		relationshipAdd: WrapThis<RelationshipAdd, C>;
		relationshipRemove: WrapThis<RelationshipRemove, C>;
		relatioshipUpdate: WrapThis<RelationshipUpdate, C>;
		typingStart: WrapThis<TypingStart, C>;
		unavailableGuildCreate: WrapThis<UnavailableGuildCreate, C>;
		userUpdate: WrapThis<UserUpdate, C>;
		voiceChannelJoin: WrapThis<VoiceChannelJoin, C>;
		voiceChannelLeave: WrapThis<VoiceChannelLeave, C>;
		voiceChannelSwitch: WrapThis<VoiceChannelSwitch, C>;
		voiceStateUpdate: WrapThis<VoiceStateUpdate, C>;
		warn: WrapThis<Warn, C>;
		debug: WrapThis<Debug, C>;
		shardDisconnect: WrapThis<ShardDisconnect, C>;
		error: WrapThis<Error, C>;
		shardPreReady: WrapThis<ShardPreReady, C>;
		connect: WrapThis<Connect, C>;
		shardReady: WrapThis<ShardReady, C>;
		shardResume: WrapThis<ShardResume, C>;
	}
}
