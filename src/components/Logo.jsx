import roastedLogo from "../assets/RoastedLogo.gif";


function LogoComponent() {
    return(
        <>
            <img 
            src={roastedLogo} 
            alt="Roasted Logo" 
            className="logoClass" 
            />
        </>
    );
};

export default LogoComponent;