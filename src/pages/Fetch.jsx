import { useEffect } from 'react';
import {useNavigate } from "react-router-dom";
import LogoComponent from '../components/Logo.jsx'
import fetchLoad from "../assets/FetchLoad.gif";
import CopyTag from '../components/CopyTag.jsx';

import { getMe, getTopArtists, getTopTracks, getRecentlyPlayed } from "../lib/spotify/api.js";

function Fetch() {

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        //Spotify Data
        const me = await getMe();
        const topArtistsRes = await getTopArtists(10);
        const topTracksRes = await getTopTracks(10);
        const recentRes = await getRecentlyPlayed(10);


        //Normalise into format for Gemini endpoints
        const profile = {
          displayName: me.display_name,
          topArtists: topArtistsRes.items.map((a) => a.name),
          topTracks: topTracksRes.items.map((t) => `${t.name} - ${t.artists?.[0]?.name ?? "Unknown"}`),
          recentlyPlayed: recentRes.items.map((i) => `${i.track.name} - ${i.track.artists?.[0]?.name ?? "Uknown"}`),
        };

        //Send to backend Gemini endpoint
        const res = await fetch("/api/roast", {
          method: "POST",
          headers: { "Content-Type" : "application/json" },
          body: JSON.stringify({ profile }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Roast API failed: ${res.status} ${text}`);
        }

        const roast = await res.json();

        //Save roast and go to roast page
        sessionStorage.setItem("roast_payload", JSON.stringify(roast));
        navigate("/roast", {replace: true});
      } catch (e) {
        navigate("/", {replace: true});
      }
    })();

  }, [navigate]);

  return (
    <>
      <LogoComponent/>
      <div className="fetchDataText">
        <h1 className="fetchDataHeader">
            Fetching Your Data...
        </h1>
      </div>
      <img 
      src={fetchLoad} 
      alt="Loading animation" 
      className="fetchLoadGif" 
      />
      <CopyTag text="We're Analyzing Your Recent Spotify Plays 🎶"/>
    </>
  );
}

export default Fetch;