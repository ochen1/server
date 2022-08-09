import { Router, Request, Response } from "express";
import { ConnectionAuthCallbackSchema, Connections, route } from "@fosscord/api";
import { emitEvent, FieldErrors, UserConnectionsUpdateEvent } from "@fosscord/util";
import { BaseConnection } from "../../../connections/BaseConnection";

const router = Router();

router.post("/", route({ body: "ConnectionAuthCallbackSchema" }), async (req: Request, res: Response) => {
	const body = req.body as ConnectionAuthCallbackSchema;

	const { connection_id } = req.params;
	const connection: BaseConnection = Connections.connections[connection_id];
	if (!connection)
		throw FieldErrors({
			provider_id: {
				code: "BASE_TYPE_CHOICES",
				message: req.t("common:field.BASE_TYPE_CHOICES", {
					types: Object.keys(Connections.connections).join(", ")
				})
			}
		});
	if (!connection.enabled)
		throw FieldErrors({
			provider_id: {
				message: "This connection has been disabled server-side."
			}
		});

	const token = await connection.exchangeCode(body.code, body.state);
	const userInfo = await connection.getUser(token);
	const connectedAccount = connection.createConnection(req.user_id, token, body.friend_sync, userInfo);
	await connectedAccount.save();

	const d = {
		event: "USER_CONNECTIONS_UPDATE",
		user_id: req.user_id,
		data: {}
	} as UserConnectionsUpdateEvent;
	await emitEvent(d);

	res.sendStatus(204);
});

export default router;
