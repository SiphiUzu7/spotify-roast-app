function LogoutButton({onClick, disabled, label="Logout"}) {
    return (
         <button className="logout-button" onClick={onClick} disabled={disabled}>
            {label}
        </button>
    );
};

export default LogoutButton;