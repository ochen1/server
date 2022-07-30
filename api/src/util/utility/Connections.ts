import { Config, DiscordApiErrors } from "@fosscord/util";
import fetch from "node-fetch";
import { URL } from "url";
import crypto from "crypto";

export interface ConnectionAuthCallbackSchema {
	code: string;
	friend_sync: boolean;
	insecure: boolean;
	state: string;
}

export interface GithubConnectionUserInfo {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
	name: string;
	company: string;
	blog: string;
	location: string;
	email: string;
	hireable?: any;
	bio: string;
	twitter_username: string;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: Date;
	updated_at: Date;
	private_gists: number;
	total_private_repos: number;
	owned_private_repos: number;
	disk_usage: number;
	collaborators: number;
	two_factor_authentication: boolean;
	plan: {
		name: string;
		space: number;
		collaborators: number;
		private_repos: number;
	};
}

// TODO: maybe make this more class-based?
// TODO: should probably have some checks if client id and/or client secret are missing while connection is enabled.
export const Connections: {
	init: () => void;
	github: {
		options: {
			enabled: boolean;
			clientId: string | null;
			clientSecret: string | null;
			authorizeUrl: string;
			tokenUrl: string;
			userUrl: string;
		};
		states: string[];
		getAuthorizeUrl: () => string;
		getToken: (code: string, state: string) => Promise<string>;
		getUser: (token: string) => Promise<GithubConnectionUserInfo>;
	};
} = {
	init: function () {
		this.github.options.enabled = Config.get().connections.github.enabled;
		this.github.options.clientId = Config.get().connections.github.clientId;
		this.github.options.clientSecret = Config.get().connections.github.clientSecret;
	},
	github: {
		options: {
			enabled: false,
			clientId: null,
			clientSecret: null,
			authorizeUrl: "https://github.com/login/oauth/authorize",
			tokenUrl: "https://github.com/login/oauth/access_token",
			userUrl: "https://api.github.com/user"
		},
		states: [] as string[],
		getAuthorizeUrl: function () {
			const state = crypto.randomBytes(16).toString("hex");
			this.states.push(state);

			const url = new URL(this.options.authorizeUrl);
			url.searchParams.append("client_id", this.options.clientId!);
			// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
			url.searchParams.append("redirect_uri", `${Config.get().cdn.endpointPrivate}/connections/github/callback`);
			url.searchParams.append("scope", "read:user");
			url.searchParams.append("state", state);
			return url.toString();
		},
		getToken: function (code: string, state: string) {
			if (!this.states.includes(state)) throw DiscordApiErrors.INVALID_OAUTH_STATE;

			const url = new URL(this.options.tokenUrl);
			url.searchParams.append("client_id", this.options.clientId!);
			url.searchParams.append("client_secret", this.options.clientSecret!);
			url.searchParams.append("code", code);
			return fetch(url.toString(), {
				method: "POST",
				headers: {
					Accept: "application/json"
				}
			})
				.then((res) => res.json())
				.then((res: { access_token: string; token_type: string; scope: string }) => res.access_token)
				.catch((e) => {
					console.error(e);
					throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
				});
		},
		getUser: function (token: string) {
			const url = new URL(this.options.userUrl);
			return fetch(url.toString(), {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`
				}
			}).then((res) => res.json());
		}
	}
};
