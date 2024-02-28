import pendingIcon from '../../assets/hyris_hy.png'

function NavButton({ tab, setTab, i, text, loading }) {
    return (
        <div
            className="navButton interactable"
            current={tab === i ? '1' : '0'}
            onClick={() => loading || tab === i || setTab(i)}
            loading={loading ? '1' : '0'}
        >
            {loading ? (
                <img className="pendingIcon" src={pendingIcon} alt=""></img>
            ) : (
                <p>{text}</p>
            )}
        </div>
    )
}

export default NavButton
