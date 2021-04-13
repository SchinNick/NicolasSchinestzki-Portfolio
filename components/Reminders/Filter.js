import { useState } from 'react'
import styles from '../../styles/Reminders/Filter.module.css'
import moment from 'moment'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { isDescendant } from '../../globals/functions'

const Filter = (props) => {
    const { name, icon, color, onClick, count, isFocused } = props
    
    return (
        <div className={styles.filter} style={{backgroundColor: isFocused ? color : "#47474E", color: isFocused ? "#fff" : "#A3A2A5"}}
            onClick={() => onClick()}>
            <div className={styles.filterTopRow}>
                <span className={styles.iconspan} style={{ backgroundColor: isFocused ? "#fff" : color }}>
                    <Icon icon={icon} color={isFocused ? color : "#fff"} style={{ fontSize: 13 }} />
                    {name === "Today" ? <p style={{color: isFocused ? color : "#fff"}}>{moment().date()}</p> : null}
                </span>
                <p style={{color: isFocused ? "#fff" : "#A3A2A5"}}>{count}</p>
            </div>
            <p>{name}</p>
        </div>
    )
}

export default Filter