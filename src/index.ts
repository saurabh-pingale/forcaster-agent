import express from "express"
import type { Request, Response } from "express";

import { commentOnCast, createCast, fetchCastsFromNeynar, likeCast } from "./services/neynar";
import { ActionType, getGeminiResponse } from "./services/gemini";
import { NEYNAR, PORT } from "./config";
import { sleep } from "./utils/utils";
import { getTrendingCastFromGemini } from "./services/getTrendingCastFromGemini";

const app = express();
const port = PORT || 8080;

interface ActionResult {
    castId: string;
    action: ActionType;
    timestamp: string;
}

export async function main(userQuery?: string): Promise<ActionResult[]> {
    const casts = await fetchCastsFromNeynar(1);

    const results: ActionResult[] = [];

    for (const cast of casts) {
        const { hash, text, timestamp } = cast;
        const { action, comment } = await getGeminiResponse(text, userQuery!);

        if (action === "like" || action === "like and comment") {
            await likeCast(hash, NEYNAR.SIGNER_UUID);
        }

        if (action === "comment" || action === "like and comment") {
            const replyText = comment || "Great cast!";
            await commentOnCast(hash, NEYNAR.SIGNER_UUID, replyText);
        }

        results.push({
            castId: hash,
            action,
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

app.post("/create-cast", async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Missing 'text' in request body" });
    }

    try {
        const result = await createCast(text, NEYNAR.SIGNER_UUID);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Create cast error:", error);
        res.status(500).json({ error: "Failed to create cast" });
    }
});

app.post("/generate-trending-cast", async (req: Request, res: Response) => {
    try {
        const casts = await fetchCastsFromNeynar(20);

        const castSummaries = casts.map((cast: { text: string }, index: number) =>
          `Cast ${index + 1}: ${cast.text.trim()}`
        ).join("\n");

        const trendingText = await getTrendingCastFromGemini(castSummaries);
        console.log("Trending Text:", trendingText);

        if (!trendingText) {
            return res.status(500).json({ error: "Failed to generate trending cast." });
        }

        const response = await createCast(trendingText, NEYNAR.SIGNER_UUID);

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error("Trending cast error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});