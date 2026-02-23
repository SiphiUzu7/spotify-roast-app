import { useState  } from "react";
import { useNavigate } from "react-router-dom";
import LogoComponent from "../components/Logo.jsx";
import RoastCard from "../components/RoastCard.jsx";
import { logoutSpotify } from "../lib/spotify/auth.js"

function Roast() {
  const navigate = useNavigate();

  const[roast, setRoast] = useState(() => {
    return JSON.parse(sessionStorage.getItem("roast_payload") || "null");
  });

  const [isRoasting, setIsRoasting] = useState(false);
  const [error, setError] = useState("");

  async function handleRoastAgain() {
    setError("");
    setIsRoasting(true);
  

  try {
    const profileRaw = sessionStorage.getItem("spotify_profile");
    if(!profileRaw) {
      navigate("/fetch", { replace: true });
      return;
    }

    const profile = JSON.parse(profileRaw);

    const text = await res.text();
    let payload = null;
    try { payload = JSON.parse(text); } catch{ /* ignore */}

    if(!res.ok){
      if(res.status === 429) {
        const retry = payload?.retryAfterSeconds ?? 60;
        setError(`Rate limited. Try again in ${retry}s.`);
        return;
      }
      throw new Error(payload?.detail || text || `Roast failed (${res.status})`);
    }

    sessionStorage.setItem("roast_payload", JSON.stringify(payload));
    setRoast(payload);
  } catch (e) {
    setError(e.message || "Roast again failed");
  } finally {
    setIsRoasting(false);
  }

}

async function handleShare() {
  try {
    if (!roast?.roastText) return;

    const shareText =
      `${roast.roastText}\n\n` + 
      `${roast.footer || ""}\n` +
      `Cringe ${roast.scores?.cringe ?? 0}/10 | MCE ${roast.scores?.mainCharacterEnergy ?? 0}/10 | Taste ${roast.scores?.tasteLevel ?? 0}/10`;

      if(navigator.share) {
        await navigator.share({ title: "Spotify Roast", text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      }
  } catch (e) {
    console.error(e);
    alert("Sharing failed (try copying again). ");
  }
}
  

function handleLogout(){
  logoutSpotify();

  //clear roast + profile data
  sessionStorage.removeItem("roast_payload");
  sessionStorage.removeItem("spotify_profile");
}



  return (
    <>
      <div className="roastText">
        <h1 className="roastHeader">
          <span>You Got</span>
          <LogoComponent />
          <span className="roastExclamation">!</span>
        </h1>
      </div>

      {error ? (
        <p style={{color: "white", textAlign: "center", padding: "0 1rem"}}>
          {error}
        </p>
      ): null }

      <RoastCard 
      roast={roast} 
      onRoastAgain={handleRoastAgain}
      onShare={handleShare}
      onLogout={handleLogout}
      isRoasting={isRoasting}
      />
    </>
  );
}

export default Roast;
