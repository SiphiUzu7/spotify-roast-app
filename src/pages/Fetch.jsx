import LogoComponent from '../components/Logo.jsx'
import fetchLoad from "../assets/FetchLoad.gif";
import CopyTag from '../components/CopyTag.jsx';

function Fetch() {
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
  )
}

export default Fetch;