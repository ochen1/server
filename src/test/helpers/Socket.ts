/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
