import { Router, Request, Response } from "express";
import { ConnectionAuthCallbackSchema, Connections, route } from "@fosscord/api";
import { HTTPError } from "lambert-server";
import { emitEvent } from "@fosscord/util";
import { BaseConnection } from "../../../connections/BaseConnection";

const router = Router();

router.post("/", route({ body: "ConnectionAuthCallbackSchema" }), async (req: Request, res: Response) => {
	const body = req.body as ConnectionAuthCallbackSchema;

	const { connection_name } = req.params;
	const connection: BaseConnection = Connections.connections[connection_name];
	if (!connection) throw new HTTPError("Unknown connection", 400);
	if (!connection.enabled) throw new HTTPError("Connection is not available", 400);

	const token = await connection.exchangeCode(body.code, body.state);
	const userInfo = await connection.getUser(token);
	const connectedAccount = connection.createConnection(req.user_id, token, body.friend_sync, userInfo);
	await connectedAccount.save();

	await emitEvent({
		event: "USER_CONNECTIONS_UPDATE",
		user_id: req.user_id
	});

	res.sendStatus(204);
});

export default router;
