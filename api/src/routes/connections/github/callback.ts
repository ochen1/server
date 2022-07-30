import { Router, Request, Response } from "express";
import { ConnectionAuthCallbackSchema, Connections, route } from "@fosscord/api";
import { HTTPError } from "lambert-server";
import { ConnectedAccount, emitEvent } from "@fosscord/util";
const router = Router();

router.post("/", route({ body: "ConnectionAuthCallbackSchema" }), async (req: Request, res: Response) => {
	const body = req.body as ConnectionAuthCallbackSchema;
	if (!Connections.github.options.enabled) throw new HTTPError("GitHub connection is not available", 400);

	const token = await Connections.github.getToken(body.code, body.state);
	const userInfo = await Connections.github.getUser(token);
	await new ConnectedAccount({
		user_id: req.user_id,
		access_token: token,
		friend_sync: body.friend_sync,
		name: userInfo.name,
		revoked: false,
		show_activity: false,
		type: "github",
		verified: true,
		visibility: 0,
		integrations: []
	}).save();

	await emitEvent({
		event: "USER_CONNECTIONS_UPDATE",
		user_id: req.user_id
	});

	res.sendStatus(204);
});

export default router;
