import axios from "axios";

import { GEMINI_URL } from "../constants";
import { GEMINI_API_KEY } from "../config";

export type ActionType = "like" | "comment" | "like and comment" | "";

export interface GeminiResponse {
  action: ActionType;
  comment: string;
}

export async function getGeminiResponse(castInfo: string, userQuery: string): Promise<GeminiResponse> {
    const prompt = `
    You are analyzing a social media cast in relation to a user’s interest.

    Your task is to:
    1. Decide the most appropriate engagement action from the following options:
       - "like" — if the cast is relevant or interesting to the user query.
       - "comment" — if the cast invites or needs a response.
       - "like and comment" — if both are appropriate.
       - Leave empty — if the cast is unrelated or irrelevant to the user query.

    2. If the action includes "comment" or "like and comment", also write a short, professional and relevant comment reply to the cast content. The comment should be positive, thoughtful, and helpful.

    User Query: ${userQuery}

    Cast Content: ${castInfo}

    Respond in this format:

    Action: one of "like", "comment", "like and comment", or empty  
    Comment: Your professional reply here (can be empty if no comment)
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

    const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    console.log("Gemini Response:", raw);

    let action: ActionType = "";
    let comment = "";

    try {
      const actionMatch = raw.match(/Action:\s*(like and comment|like|comment)/i);
      const commentMatch = raw.match(/Comment:\s*([\s\S]*)/i);


      if (actionMatch) {
        const value = actionMatch[1]?.toLowerCase().trim();
        if (value === "like" || value === "comment" || value === "like and comment") {
          action = value;
        }
      }

      if (commentMatch) {
        comment = commentMatch[1]?.trim() || "";
      }
    } catch (err) {
      console.error("Failed to extract from Gemini response:", raw);
    }

    console.log("Action:", action);
    console.log("Comment:", comment);

  return { action, comment };
}