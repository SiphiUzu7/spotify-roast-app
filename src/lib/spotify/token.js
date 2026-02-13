

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export async function exchangeCodeForToken(code) {
    const verifier = sessionStorage.getItem("spotify_code_verifier");
    if (!verifier) throw new Error("Missing PCKE code verifier (did you refresh callback page?)");

    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
    });


    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token exchange failed: &{res.status} ${text}`);
    }
    
    const data = await res.json();

    //save the tokens
    sessionStorage.setItem("spotify_access_token", data.access_token);
    const expiresAt = Date.now() + data.expires_in * 1000 - 30_000;
    sessionStorage.setItem("spotify_expires_at", String(expiresAt));

    if (data.refresh_token) {
        localStorage.setItem("spotify_refresh_token", data.refresh_token);
    }

    return data;

}