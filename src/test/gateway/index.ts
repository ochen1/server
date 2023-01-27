import { Payload, Server as GatewayServer } from "@fosscord/gateway";
import { ReadyEventData } from "@fosscord/util";
import {
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

test.after(
	"Teardown",
	(t) =>
		new Promise((resolve) => {
			// settimout because sqlite will crash otherwise
			t.context.gateway.stop().then(() => setTimeout(resolve, 100));
		}),
);

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
