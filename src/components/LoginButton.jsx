

function LoginButton({onClick}) {
    return (
         <button className="login-button" onClick={onClick}>
            Login with Spotify
        </button>
    );
};

export default LoginButton;