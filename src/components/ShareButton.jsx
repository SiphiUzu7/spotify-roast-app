function ShareButton({ onClick, disabled, label ="Share"}) {
    return (
         <button className="share-button" onClick={onClick} disabled={disabled}>
            {label}
        </button>
    );
};

export default ShareButton;