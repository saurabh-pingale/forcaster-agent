import axios from "axios";

import { NEYNAR_API_KEY } from "../config";
import { NEYNAR_URL } from "../constants";

export async function fetchCastsFromNeynar(limit: number = 20) {
    const FID = "905779";
    const response = await axios.get(NEYNAR_URL, {
        headers: {
            'x-api-key': NEYNAR_API_KEY
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