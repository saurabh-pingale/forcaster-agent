import express from "express"
import type { Request, Response } from "express";

import { fetchCastsFromNeynar } from "./services/neynar";
import { ActionType, getGeminiResponse } from "./services/gemini";
import { PORT } from "./config";
import { sleep } from "./utils/utils";

const app = express();
const port = PORT || 8080;

interface ActionResult {
    castId: string;
    action: ActionType;
    timestamp: string;
}

export async function main(userQuery?: string): Promise<ActionResult[]> {
    const casts = await fetchCastsFromNeynar(5);
    console.log("Casts:", casts);

    const results: ActionResult[] = [];

    for (const cast of casts) {
        const { hash, text, timestamp } = cast;
        const response = await getGeminiResponse(text, userQuery!);

        results.push({
            castId: hash,
            action: response,
            timestamp
        });

        await sleep(500);
    }

    return results;
}

app.use(express.json()); 

app.get("/", async (req: Request, res: Response) => {
    const { userQuery } = req.body;
    console.log("User Query:", userQuery);

    if (!userQuery) {
      return res.status(400).json({ error: "Missing userQuery in request body" });
    }

    try {
        const results = await main(userQuery);
        console.log("Final Actions:", results)
        res.status(200).json({ success: true, data: results })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});