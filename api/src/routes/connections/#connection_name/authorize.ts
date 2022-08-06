import { Router, Request, Response } from "express";
import { Connections, route } from "@fosscord/api";
import { HTTPError } from "lambert-server";
import { BaseConnection } from "../../../connections/BaseConnection";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { connection_name } = req.params;
	const connection: BaseConnection = Connections.connections[connection_name];
	if (!connection) throw new HTTPError("Unknown connection", 400);
	if (!connection.enabled) throw new HTTPError("Connection is not available", 400);

	res.json({
		url: connection.makeAuthorizeUrl()
	});
});

export default router;
