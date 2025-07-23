import axios from "axios";

import { NEYNAR } from "../config";
import { NEYNAR_BASE_URL } from "../constants";

export async function fetchCastsFromNeynar(limit: number = 20) {
    const FID = "905779";
    const response = await axios.get(`${NEYNAR_BASE_URL}/farcaster/feed/user/casts`, {
        headers: {
            'x-api-key': NEYNAR.API_KEY
        },
        params: { 
            fid: FID,
            feed_type: 'filter',
            filter_type: 'fids', 
            limit
        }
    });

    if (response.data && response.data.casts) {
            return response.data.casts.map((cast: any) => ({
                hash: cast.hash,
                text: cast.text,
                timestamp: cast.timestamp,
            }));
        }
        return [];
}

export async function createCast(text: string, signerUuid: string) {
    const response = await axios.post(`${NEYNAR_BASE_URL}/farcaster/cast`, {
        signer_uuid: signerUuid,
        text: text
    }, {
        headers: { 'x-api-key': NEYNAR.API_KEY }
    });
    return response.data;
}

export async function likeCast(castHash: string, signerUuid: string) {
    const response = await axios.post(`${NEYNAR_BASE_URL}/farcaster/reaction`, {
        signer_uuid: signerUuid,
        reaction_type: "like",
        target: castHash
    }, {
        headers: { 'x-api-key': NEYNAR.API_KEY }
    });
    return response.data;
}

export async function commentOnCast(castHash: string, signerUuid: string, text: string) {
    const response = await axios.post(`${NEYNAR_BASE_URL}/farcaster/cast`, {
        signer_uuid: signerUuid,
        text: text,
        parent: castHash
    }, {
        headers: { 'x-api-key': NEYNAR.API_KEY }
    });
    return response.data;
}