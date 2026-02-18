

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
            
        }
    })




}