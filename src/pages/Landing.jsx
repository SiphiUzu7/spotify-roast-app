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
            <span className='landingHeaderGreen'>Your Spotify Listen History!</span>
        </h1>
      </div>
      <img 
      src={heroArtwork} 
      alt="" 
      className="landingHeroArtwork" 
      />
      <LoginButton/>
      <CopyTag/>
    </>
  )
}

export default Landing;