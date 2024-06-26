import express, { Router } from "express";
import ViteExpress from "vite-express";
import { Request, Response } from "express";
import getSignedKey from "./getSignedKey";
import neynarClient from "./neynatClient";
import getUsername from "./getUsername";
import "dotenv/config";
import fetch from "node-fetch";
import { get } from "http";
import { FarcasterUser } from "../src/components/types";

const PORT = process.env.PORT || 3000;
const NEYNAR_API_KEY = process.env.VITE_NEYNAR_API_KEY;

const app = express();
app.use(express.json());

const router = Router();

router.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

router.get("/getPosts", async (_: Request, res: Response) => {
  try {
  } catch (error) {
    console.error(error);
  }
});

router.post("/signer", async (_, res: Response) => {
  try {
    const signedKey = await getSignedKey();
    return res.status(200).send(signedKey);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/signer/:signer_uuid", async (req: Request, res: Response) => {
  const signer_uuid = req.params.signer_uuid;
  if (!signer_uuid) {
    return res.status(400).send("signer_uuid is required");
  }
  try {
    const signer = await neynarClient.lookupSigner(signer_uuid);
    const displayName = signer.fid ? await getUsername(signer.fid) : undefined;
    const result: FarcasterUser = { ...signer, display_name: displayName };
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/cast", async (req: Request, res: Response) => {
  const channelId: string = "dead";
  let body = req.body;
  const url = "https://api.neynar.com/v2/farcaster/cast";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      api_key: NEYNAR_API_KEY || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      signer_uuid: body.signer_uuid,
      text: body.text,
      channel_id: channelId,
    }),
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((json) => res.status(200).send(json))
    .catch((err) => res.status);
});

app.use("/api/", router);

ViteExpress.listen(app, Number(PORT), () =>
  console.log(`Server is listening on port ${PORT}...`)
);
