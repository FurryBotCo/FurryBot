declare namespace Lavalink {
	type ValidTypes = "youtube";

	interface Generic {
		loadType: string;
	}

	interface Track {
		track: string;
		info: {
			identifier: string;
			isSeekable: boolean;
			author: string;
			length: number;
			isStream: boolean;
			position: number;
			title: string;
			uri: string;
		};
	}

	interface SearchResult extends Generic {
		loadType: "SEARCH_RESULT";
		playlistInfo: {};
		tracks: Track[];
	}

	interface TrackLoaded extends Generic {
		loadType: "TRACK_LOADED";
		playlistInfo: {};
		tracks: Track[];
	}

	interface PlaylistLoaded extends Generic {
		loadType: "SEARCH_RESULT";
		playlistInfo: {
			name: string;
			selectedTrack: number;
		};
		tracks: Track[];
	}

	interface LoadFailed extends Generic {
		loadType: "LOAD_FAILED";
		playlistInfo: {};
		tracks: Track[];
		exception: {
			message: string;
			severity: "COMMON"; // @TODO
		};
	}

	type AnyResult = SearchResult | TrackLoaded | PlaylistLoaded | LoadFailed;
}

export = Lavalink;
