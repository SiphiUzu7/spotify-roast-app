

import { generateCodeVerifier, generateCodeChallenge } from "./pcke";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

const SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
];


export async function loginWithSpotify() {
    const verifier = generateCodeVerifier(64);
    const challenge = await generateCodeChallenge(verifier);

    sessionStorage.setItem("spotify_code_verifier");

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(" "),
        code_challenge_method: "S256",
        code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function logoutSpotify() {
    sessionStorage.removeItem("spotify_access_token");
    sessionStorage.removeItem("spotify_expires_at");
    localStorage.removeItem("spotify_refresh_token");
    sessionStorage.removeItem("spotify_code_verifier");
}