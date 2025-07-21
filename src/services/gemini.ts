import axios from "axios";

import { GEMINI_URL } from "../constants";
import { GEMINI_API_KEY } from "../config";

export type ActionType = "like" | "comment" | "like and comment" | "";

export async function getGeminiResponse(castInfo: string, userQuery: string): Promise<ActionType> {
    const prompt = `
    You are analyzing a social media cast in relation to a user’s interest.

    Decide the most relevant engagement action to take based on how well the cast aligns with the user's query. Return only one of the following:

    - "like" — if the cast is relevant or interesting to the user query.
    - "comment" — if the cast invites or needs a response.
    - "like and comment" — if both are appropriate.
    - Leave empty — if the cast is unrelated or irrelevant to the user query.

    User Query: ${userQuery}

    Cast Content: ${castInfo}

    Respond with only one of: like, comment, like and comment, or leave empty.
    `;

    const response = await axios.post( GEMINI_URL,
      {
        contents: [{ parts: [{ text: prompt.trim() }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
      }
    );

    const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "";

    if (raw.includes("like and comment")) return "like and comment";
    if (raw.includes("comment")) return "comment";
    if (raw.includes("like")) return "like";

    return "";
}