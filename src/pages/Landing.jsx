import LogoComponent from '../components/Logo.jsx'
import heroArtwork from "../assets/HeroArtwork.png";
import LoginButton from '../components/LoginButton.jsx';
import CopyTag from '../components/CopyTag.jsx';

function Landing() {
  return (
    <>
      <LogoComponent/>
      <div className="landingRoastText">
        <h1 className="landingHeader">
            Get Roasted Based On 
            <span className='landingHeaderGreen'>Your Spotify Plays!</span>
        </h1>
      </div>
      <img 
      src={heroArtwork} 
      alt="Hero Banner" 
      className="landingHeroArtwork" 
      />
      <LoginButton/>
      <CopyTag text="By Logging In, You Agree To Get Roasted 🔥"/>
    </>
  )
}

export default Landing;