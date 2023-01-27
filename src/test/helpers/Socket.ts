import { Payload } from "@fosscord/gateway";
import { WebSocket } from "ws";
import BigIntJson from "json-bigint";
const bigIntJson = BigIntJson({ storeAsString: true });

export function createSocketAndConnect(url: string): Promise<WebSocket> {
	return new Promise((resolve) => {
		const socket = new WebSocket(url);
		socket.once("open", () => resolve(socket));
	});
}

export function sendPayload(
	this: WebSocket,
	payload: Payload,
): Promise<Payload> {
	return new Promise((resolve, reject) => {
		this.once("message", (data) => {
			// TODO: erlpack and compression?
			const resp = bigIntJson.parse(data.toString());

			resolve(resp);
		});

		this.once("close", reject);
		this.once("error", reject);

		this.send(JSON.stringify(payload));
	});
}
