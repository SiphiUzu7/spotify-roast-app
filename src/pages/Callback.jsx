

import { useEffect } from "react";
import {useNavigate } from "react-router-dom";
import { exchangeCodeForToken } from "../lib/spotify/token";

function Callback (){
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");

        if(error) {
            console.error("Spotify auth error:", error);
            navigate("/", {replace: true });
            return;
        }

        if(!code) {
            console.error("No code in callback URL");
            navigate("/", {replace: true});
            return;
        }

        const CODE_KEY = "spotify_auth_code_processed";
        if (sessionStorage.getItem(CODE_KEY) === code){
            navigate("/fetch", {replace:true});
            return;
        }
        sessionStorage.setItem(CODE_KEY, code);

        (async() => {
            try{
                await exchangeCodeForToken(code);
                navigate("/fetch",{replace: true});
            } catch (e) {
                //allow retry if exchange failed
                sessionStorage.removeItem(CODE_KEY);
                console.error(e);
                navigate("/", {replace: true});

            }
            })();
        }, [navigate]); 

        return (
            <div style={{color: "white", padding: "2rem", textAlign: "center"}}>
                Logging you in...
            </div>
        );

    }


export default Callback;