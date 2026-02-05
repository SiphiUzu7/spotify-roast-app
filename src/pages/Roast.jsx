import LogoComponent from "../components/Logo.jsx";
import RoastCard from "../components/RoastCard.jsx";

function Roast() {
  return (
    <>
      <div className="roastText">
        <h1 className="roastHeader">
          <span>You Got</span>
          <LogoComponent />
          <span className="roastExclamation">!</span>
        </h1>
      </div>

      <RoastCard />
    </>
  );
}

export default Roast;
