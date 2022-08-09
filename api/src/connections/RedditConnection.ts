import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import fetch from "node-fetch";
import { BaseConnection, OAuthTokenResponse } from "./BaseConnection";

// TODO: do we really need all this when we only use name?
export interface RedditConnectionUser {
	is_employee: boolean;
	seen_layout_switch: boolean;
	has_visited_new_profile: boolean;
	pref_no_profanity: boolean;
	has_external_account: boolean;
	pref_geopopular: string;
	seen_redesign_modal: boolean;
	pref_show_trending: boolean;
	// subreddit: Subreddit;
	pref_show_presence: boolean;
	snoovatar_img: string;
	snoovatar_size?: number[] | null;
	gold_expiration?: null;
	has_gold_subscription: boolean;
	is_sponsor: boolean;
	num_friends: number;
	// features: Features;
	can_edit_name: boolean;
	verified: boolean;
	pref_autoplay: boolean;
	coins: number;
	has_paypal_subscription: boolean;
	has_subscribed_to_premium: boolean;
	id: string;
	has_stripe_subscription: boolean;
	oauth_client_id: string;
	can_create_subreddit: boolean;
	over_18: boolean;
	is_gold: boolean;
	is_mod: boolean;
	awarder_karma: number;
	suspension_expiration_utc?: null;
	has_verified_email: boolean;
	is_suspended: boolean;
	pref_video_autoplay: boolean;
	has_android_subscription: boolean;
	in_redesign_beta: boolean;
	icon_img: string;
	pref_nightmode: boolean;
	awardee_karma: number;
	hide_from_robots: boolean;
	password_set: boolean;
	link_karma: number;
	force_password_reset: boolean;
	total_karma: number;
	seen_give_award_tooltip: boolean;
	inbox_count: number;
	seen_premium_adblock_modal: boolean;
	pref_top_karma_subreddits: boolean;
	pref_show_snoovatar: boolean;
	name: string;
	pref_clickgadget: number;
	created: number;
	gold_creddits: number;
	created_utc: number;
	has_ios_subscription: boolean;
	pref_show_twitter: boolean;
	in_beta: boolean;
	comment_karma: number;
	accept_followers: boolean;
	has_subscribed: boolean;
	linked_identities?: string[] | null;
	seen_subreddit_chat_ftux: boolean;
}

export interface RedditConnectionErrorResponse {
	message: string;
	error: number;
}
export class RedditConnection extends BaseConnection {
	constructor() {
		super({
			name: "reddit",
			authorizeUrl: "https://www.reddit.com/api/v1/authorize",
			tokenUrl: "https://www.reddit.com/api/v1/access_token",
			userInfoUrl: "https://oauth.reddit.com/api/v1/me",
			scopes: ["identity"]
		});
	}

	makeAuthorizeUrl(): string {
		const state = this.createState();

		const url = new URL(this.options.authorizeUrl);

		url.searchParams.append("client_id", this.clientId!);
		// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
		url.searchParams.append("redirect_uri", `${Config.get().cdn.endpointPrivate}/connections/${this.options.name}/callback`);
		url.searchParams.append("response_type", "code");
		url.searchParams.append("scope", this.options.scopes.join(" "));
		url.searchParams.append("state", state);
		return url.toString();
	}

	makeTokenUrl(): string {
		return this.options.tokenUrl;
	}

	async exchangeCode(code: string, state: string): Promise<string> {
		this.validateState(state);

		const url = this.makeTokenUrl();

		return fetch(url.toString(), {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: `${Config.get().cdn.endpointPrivate}/connections/${this.options.name}/callback`
			})
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse & RedditConnectionErrorResponse) => {
				if (res.error) {
					throw new Error(res.message);
				}

				return res.access_token;
			})
			.catch((e) => {
				console.error(`Error exchanging token for Reddit connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<RedditConnectionUser> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((res) => res.json());
	}

	createConnection(userId: string, token: string, friend_sync: boolean, userInfo: RedditConnectionUser): ConnectedAccount {
		return new ConnectedAccount({
			user_id: userId,
			id: userInfo.id,
			access_token: token,
			friend_sync: friend_sync,
			name: userInfo.name,
			revoked: false,
			show_activity: false,
			type: this.options.name,
			verified: userInfo.has_verified_email,
			visibility: 0,
			integrations: []
		});
	}
}
