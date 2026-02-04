import LogoComponent from '../components/Logo.jsx'

function Roast() {
  return (
    <>
      <div className="roastText">
      <h1 className="roastHeader">
        <span>You Got</span>
        <LogoComponent />
        <span >!</span>
      </h1>
    </div>
    </>
  )
};

export default Roast;