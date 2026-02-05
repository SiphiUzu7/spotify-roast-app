import ShareFlame from "../assets/ShareFlame.gif";
import RoastButton from "../components/RoastButton.jsx";
import ShareButton from "../components/ShareButton.jsx";
import LogoutButton from "../components/LogoutButton.jsx";

function RoastCard() {
    return(
        <>
        <div className="roastCardContainer">
            <div className="roastCardBody">
                <p className="roastCardText">
                    Dang, you're out there livin' your best life as some emo 
                    meets Metallica meets K-POP sprinkle of mid '00s. Your 
                    playlist screams "I can be anything but normal!" teehee
                </p>
                <div className="divider"></div>
                <div className="roastCardScoreList">
                    Cringe: 8.9/10 <br /> Main Character Energy: 3.1/10 <br /> Taste Level: 5.1/10 <br />
                </div>
                <p className="roastCardFooter">
                    The good news is, you own 
                    your chaos like a champ!
                </p>

            </div>

            <img 
                className='shareFlameGifOverlay'
                src={ShareFlame} 
                alt="Share Flame" 
            />
        </div>
        <div className="roastButtonSection">
            <RoastButton/>
            <ShareButton/>
            
        </div>
            <LogoutButton/>
        </>
    );
};

export default RoastCard;