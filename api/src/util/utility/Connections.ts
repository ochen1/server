import { BaseConnection, EpicGamesConnection, GitHubConnection, RedditConnection } from "../../connections";

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
		epicgames: new EpicGamesConnection()
	},
	init: () => {
		for (const connection of Object.values(Connections.connections)) {
			connection.init();
		}
	}
};
