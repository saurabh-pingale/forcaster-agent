import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;

export const NEYNAR = {
    API_KEY: process.env.NEYNAR_API_KEY,
    SIGNER_UUID: process.env.NEYNAR_SIGNER_UUID!
} 

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;