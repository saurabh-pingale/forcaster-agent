import axios from "axios";
import { GEMINI_URL } from "../constants";
import { GEMINI_API_KEY } from "../config";

export async function getTrendingCastFromGemini(castSummaries: string): Promise<string> {
    const prompt = `
    You write viral content for social media.

    Given 20 recent social media casts (which may vary in topic), identify those related to technology (AI, gadgets, startups, software, etc.), analyze their themes and tone, and generate a new trending cast that could go viral based on the key ideas or excitement from the relevant ones.

    Guidelines:
    - Be relevant to tech
    - Use a short, catchy, tweet-style tone
    - Avoid copying any cast directly

    Casts:
    ${castSummaries}

    Respond ONLY with the new cast text.
    `;

    const response = await axios.post(
        GEMINI_URL,
        { contents: [{ parts: [{ text: prompt.trim() }] }] },
        {
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": GEMINI_API_KEY,
            },
        }
    );

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log("Generated Trending Cast:", generatedText);
    return generatedText || "";
}