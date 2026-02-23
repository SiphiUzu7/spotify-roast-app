import ShareFlame from "../assets/ShareFlame.gif";
import RoastButton from "../components/RoastButton.jsx";
import ShareButton from "../components/ShareButton.jsx";
import LogoutButton from "../components/LogoutButton.jsx";

function RoastCard({ roast, onRoastAgain, onShare, onLogout, isRoasting }) {
    const roastText = roast?.roastText ?? "Your roast will appear here...";
    const scores = roast?.scores ?? { cringe: 0, mainCharacterEnergy: 0, tasteLevel: 0};
    const footer = roast?.footer ?? "";

    return(
        <>
        <div className="roastCardContainer">
            <div className="roastCardBody">
                <p className="roastCardText">{roastText}</p>
                <div className="divider"></div>
                <div className="roastCardScoreList">
                    Cringe: {scores.cringe}/10 <br />
                    Main Character Energy: {scores.mainCharacterEnergy}/10 <br />
                    Taste Level: {scores.tasteLevel}/10 <br />
                </div>

                <p className="roastCardFooter">{footer}</p>

            </div>

            <img 
                className='shareFlameGifOverlay'
                src={ShareFlame} 
                alt="Share Flame" 
            />
        </div>
        <div className="roastButtonSection">
            <RoastButton onClick={onRoastAgain} disabled={isRoasting} label={isRoasting ? "Roasting..." : "Roast Me Again"}/>
            <ShareButton onClick={onShare} disabled={isRoasting}/>
            
        </div>
            <LogoutButton onClick={onLogout} disabled={isRoasting}/>
        </>
    );
};

export default RoastCard;