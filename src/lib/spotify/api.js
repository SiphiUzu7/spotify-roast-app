import { getAccessToken, isTokenExpired, refreshAccessToken } from "./token";

async function spotifyFetch(path) {
    if(isTokenExpired()) {
        await refreshAccessToken();
    }

    const token = getAccessToken();
    if(!token) throw new Error("No acces token");
    

    const res = await fetch(`https://api.spotify.com/v1${path}`, {
        headers: {Authorization: `Bearer ${token}`},
    });
}