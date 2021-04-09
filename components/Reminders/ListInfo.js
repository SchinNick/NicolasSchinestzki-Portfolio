import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { isDescendant } from '../../globals/functions'
import styles from '../../styles/Reminders/ListInfo.module.css'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'



const ListInfo = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false)
    const [showIconConfig, setShowIconConfig] = useState(false)
    const [listInfo, setListInfo] = useState(null)
    const initialName = useRef()
    const listId = useRef()
    const inputRef = useRef()

    useImperativeHandle(ref, () => ({
        show: (id, listInfo) => {
            setVisible(true)
            setListInfo(listInfo)
            initialName.current = listInfo.name
            listId.current = id
        }
    }))

    useEffect(() => {
        inputRef.current?.select()
    }, [])

    const updateList = () => {
        props.updateList(listId.current, { ...listInfo })
        exit()
    }

    const exit = () => {
        setShowIconConfig(false)
        setListInfo(null)
        setVisible(false)
    }

    const blurHandle = (e) => {
        const target = e.relatedTarget
        const parent = e.currentTarget
        if (!isDescendant(parent, target)) {
            setShowIconConfig(false)
        }
    }
    

    const colorsToPick = ["#FC4741", "#FD9E2B", "#FED533", "#3BCF61", "#7BC4FD", "#1C87FB",
        "#5F61E3", "#FC527B", "#D483F2", "#C8A578", "#727E87", "#EAB5AF"]
    
    const iconsToPick = ["grin-alt", "list-ul", "bookmark", "map-pin", "gift", "birthday-cake",
        "graduation-cap", "hiking", "pencil-ruler", "file", "book-open", "folder",
        "credit-card", "money-bill-alt", "dumbbell", "running", "utensils", "wine-glass",
        "pills", "stethoscope", "chair", "home", "building", "university",
        "campground", "tv", "music", "tablet-alt", "gamepad", "headphones-alt",
        "leaf", "carrot", "male", "user-friends", "users", "paw",
        "snowman", "fish", "shopping-basket", "shopping-cart", "shopping-bag", "box",
        "futbol", "baseball-ball", "basketball-ball", "football-ball", "table-tennis", "subway",
        "plane", "ship", "car-alt", "umbrella-beach", "sun", "moon",
        "tint", "snowflake", "fire", "suitcase", "tools", "cut",
        "drafting-compass", "code", "lightbulb", "comment-alt", "shoe-prints", "asterisk",
        "square", "circle", "shapes", "bacon", "heart", "star"]

    return (
        visible ?
            <div className={styles.modal}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <span onClick={() => setShowIconConfig(true)} className={styles.iconCircle} style={{ backgroundColor: listInfo?.color }}>
                            <Icon icon={listInfo?.icon} size="2x" color="#fff" />
                            <span className={styles.iconShadow}>
                                edit
                        </span>
                        </span>
                        <div className={styles.info}>
                            <span className={styles.title}>"{initialName?.current}" Info</span>
                            <div className={styles.inputContainer}>
                                <label>Name: </label>
                                <input autoFocus={true} ref={inputRef} value={listInfo?.name} onChange={(e) => setListInfo({ ...listInfo, name: e.currentTarget.value })} className={styles.input} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.buttons}>
                        <span className={`${styles.button} ${styles.cancel}`} onClick={() => exit()}>Cancel</span>
                        <span className={`${styles.button} ${styles.ok}`} onClick={() => updateList()}>OK</span>
                    </div>
                    {showIconConfig ?
                        <div className={styles.iconConfigContainer} tabIndex={-1}
                            onBlur={(e) => blurHandle(e)}>
                            <div className={styles.colorsContainer}>
                                {colorsToPick.map(c => (
                                    <span onClick={() => setListInfo({...listInfo, color: c})} 
                                        className={`${styles.colorPick} ${c === listInfo?.color ? styles.active : ""}`} 
                                        tabIndex={-1}>
                                        <span style={{ backgroundColor: c}}></span>
                                    </span>
                                ))}
                            </div>
                            <div className={styles.divider}></div> 
                            <div className={styles.iconsContainer}>
                                {iconsToPick.map(i => (
                                    <span onClick={() => setListInfo({...listInfo, icon: i})}
                                        className={`${styles.iconPick} ${i === listInfo?.icon ? styles.active : ""}`}
                                        tabIndex={-1}>
                                        <span>
                                            <Icon icon={i} className={styles.icon} color="#fff" />
                                        </span>  
                                    </span>
                                ))}
                            </div>
                        </div>
                        : null}
                </div>
            </div>
            : null
    )
})

export default ListInfo