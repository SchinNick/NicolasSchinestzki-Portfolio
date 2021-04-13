import { useEffect, useRef, useState } from 'react'
import { wait } from '../../globals/functions'
import styles from '../../styles/Reminders/List.module.css'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'

const List = (props) => {
    const { active, color, icon, name, reminders, index, id } = props
    const inputRef = useRef()
    const [focused, setFocus] = useState(false)
    const [editing, setEditing] = useState(props.new)
    const [editedName, setEditedName] = useState(name)

    useEffect(() => {
        if (editing) {
            wait(100).then(() => {
                inputRef.current?.select()
            })
        }
    }, [editing])

    const blur = () => {
        if(name !== editedName){
            props.updateList(id, editedName)
        }
        setEditing(false)
        setFocus(false)
    }

    const handleKeyboard = (e) => {
        if(e.key === "Escape"){
            setEditing(false)
        }else if(e.key === "Enter"){
            props.updateList(id, {new: false, name: editedName})
            setEditing(false)
        }
        else if(e.key === "Delete" || e.key === "Backspace" && !editing){
            props.deleteList(id)
        }
    }

    return (
        <div onDoubleClick={() => props.editListInfo(id, {icon, name, color})} onFocus={() => setFocus(true)} onBlur={() => blur()}
            onClick={() => props.setActiveList()} onKeyDown={(e) => handleKeyboard(e)}
            className={styles.list} style={{ backgroundColor: focused ? "#1C69BB" : (active ? "#43424A" : 'transparent') }}
            tabIndex={-1}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <span className={styles.iconspan} style={{ backgroundColor: color, marginRight: 8 }}>
                    <Icon icon={icon} color="#fff" style={{ fontSize: 13 }} />
                </span>
                {editing ?
                    <input className={styles.listInput} value={editedName} onChange={(e) => setEditedName(e.currentTarget.value)}
                        autoFocus={editing} ref={inputRef} />
                    :
                    <p>{name}</p>
                }
            </div>
            <p style={{ color: "#85828A", fontWeight: 600 }}>{reminders.length}</p>
        </div>
    )
}

export default List