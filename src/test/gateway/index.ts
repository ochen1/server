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

import { Payload, Server as GatewayServer } from "@fosscord/gateway";
import { ReadyEventData } from "@fosscord/util";
import {
	closeTestDatabaseConnection,
	createSocketAndConnect,
	createTestDatabaseConnection,
	createTestUser,
	sendPayload,
	suppressConsole,
} from "../helpers";

import anyTest, { TestFn } from "ava";
const test = anyTest as TestFn<{ gateway: GatewayServer }>;

test.before("Setup", async (t) => {
	suppressConsole();
	await createTestDatabaseConnection();
	const gateway = new GatewayServer({ port: 8080 });
	await gateway.start();

	t.context.gateway = gateway;
});

test.after.always("Teardown", async (t) => {
	await t.context.gateway.stop();
	await new Promise(
		(resolve) =>
			setTimeout(() => {
				closeTestDatabaseConnection().then(resolve);
			}, 200), // wait for the close handlers to finish
	);
});

test("Identify", async (t) => {
	const { user, token } = await createTestUser();
	const socket = await createSocketAndConnect("ws://localhost:8080");
	const resp = (await sendPayload.bind(socket)({
		d: { token: token },
		op: 2,
	})) as Omit<Payload, "d"> & { d: ReadyEventData };
	socket.close();

	t.is(resp.op, 0);
	t.is(resp.t, "READY");
	t.is(resp.d.user.id, user.id);

	// TODO: actually good tests?
});
