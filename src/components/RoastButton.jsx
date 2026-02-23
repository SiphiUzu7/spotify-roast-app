function RoastButton({ onClick, disabled, label = "Roast Me Again"}) {
    return (
         <button className="roast-button" onClick={onClick} disabled={disabled}>
            {label}
        </button>
    );
};

export default RoastButton;