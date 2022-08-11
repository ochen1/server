import {
	BaseConnection,
	BattleNetConnection,
	EpicGamesConnection,
	GitHubConnection,
	RedditConnection,
	TwitchConnection,
	YouTubeConnection
} from "../../connections";

export interface ConnectionAuthCallbackSchema {
	code: string;
	friend_sync: boolean;
	insecure: boolean;
	state: string;
}

export const Connections: {
	connections: { [key: string]: BaseConnection };
	init: () => void;
} = {
	connections: {
		github: new GitHubConnection(),
		reddit: new RedditConnection(),
		epicgames: new EpicGamesConnection(),
		youtube: new YouTubeConnection(),
		twitch: new TwitchConnection(),
		battlenet: new BattleNetConnection()
	},
	init: () => {
		for (const connection of Object.values(Connections.connections)) {
			connection.init();
		}
	}
};
