import anyTest, { TestFn } from "ava";
import { DataSource } from "typeorm";
import { genSessionId, Payload, WebSocket } from "@fosscord/gateway";
import { Config, generateToken, User } from "@fosscord/util";
import { onIdentify } from "../../gateway/opcodes/Identify";
import * as SendUtil from "../../gateway/util/Send";
import path from "path";
import { EventEmitter } from "events";

const emitter = new EventEmitter();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
SendUtil.Send = (socket: WebSocket, data: Payload) => {
	emitter.emit("send", data);
};

type ContextType = { db: DataSource; userToken: string; ready: Payload };
const test = anyTest as TestFn<ContextType>;

test.serial.before("Create database connection", async (t) => {
	const datasource = new DataSource({
		type: "sqlite",
		database: ":memory:",
		entities: [
			path.join(process.cwd(), "dist", "util", "entities", "*.js"),
		],
		synchronize: true,
	});

	t.context.db = await datasource.initialize();

	await Config.init();
});

test.serial.before("Register user", async (t) => {
	const user = await User.register({
		email: "test@test.com",
		username: "test",
		password: "test",
	});

	const token = await generateToken(user.id);

	t.context.userToken = token;
});

test.serial.before(
	"Send identify",
	(t) =>
		new Promise((resolve, reject) => {
			const socket: Partial<WebSocket> = {
				session_id: genSessionId(),
				encoding: "json",
				events: {},
				permissions: {},
				member_events: {},
				once: (event) => {
					return socket as WebSocket;
				},
			};

			emitter.on("send", (data: Payload) => {
				t.context.ready = data;
				resolve();
			});

			onIdentify.bind(socket as WebSocket)({
				d: {
					token: t.context.userToken,
				},
				op: 0,
			});
		}),
);

test.todo("READY is properly formed");

// uhh

test.after("Destroy the database", async (t) => {
	await t.context.db.destroy();
});
