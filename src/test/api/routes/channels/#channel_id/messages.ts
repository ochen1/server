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

import { Channel, Guild, Member, MessageCreateSchema } from "@fosscord/util";
import { setupApiTest, createTestUser } from "@fosscord/test";
import MessagesRoute from "@fosscord/api/routes/channels/#channel_id/messages";
import supertest from "supertest";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{ channel: Channel; userToken: string }>;

const app = setupApiTest(test);
app.use("/:channel_id/messages", MessagesRoute);

test.serial.before("Create channel and messages", async (t) => {
	const guild = await Guild.createGuild({ name: "test" });
	const channel = await Channel.create({
		name: "test channel",
		type: 0,
		guild: guild,
		created_at: new Date(),
	}).save();

	t.context.channel = channel;
	const { user, token } = await createTestUser();
	t.context.userToken = token;

	await Member.addToGuild(user.id, guild.id);
});

test.serial("Send plain text message", async (t) => {
	const res = await supertest(app)
		.post(`/${t.context.channel.id}/messages`)
		.auth(t.context.userToken, { type: "bearer" })
		.send({
			content: `this is test message`,
		} as MessageCreateSchema);

	t.is(res.status, 200, res.text);

	// TODO: check if MESSAGE_CREATE is emitted
});

test.todo("Send attachment");
test.todo("Send embed");
test.todo("Send url");
test.todo("Send role ping");

test.serial("Get messages no args", async (t) => {
	const res = await supertest(app)
		.get(`/${t.context.channel.id}/messages`)
		.auth(t.context.userToken, { type: "bearer" });

	t.is(res.status, 200, res.text);
	t.assert(res.body.length > 0);
});
