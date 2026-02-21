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

    if(!res.ok) {
        const text = await res.text();
        throw new Error(`Spotify API error ${res.status}: ${text}`);
    }

    return res.json();
}


export async function getMe() {
    return spotifyFetch("/me");
}

export async function getTopArtists(limit = 10) {
    return spotifyFetch(`/me/top/artists?limit=${limit}&time_range=short_term`);
}

export async function getTopTracks(limit = 10) {
    return spotifyFetch(`/me/top/tracks?limit=${limit}&time_range=short_term`);
}

export async function getRecentlyPlayed(limit = 10) {
    return spotifyFetch(`/me/player/recently-played?limit=${limit}&time_range=short_term`);
}








