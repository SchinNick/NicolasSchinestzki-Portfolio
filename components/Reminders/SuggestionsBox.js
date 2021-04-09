import { useEffect, useState } from 'react'
import styles from '../../styles/Reminders/SuggestionsBox.module.css'
import moment from 'moment'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'




export const DATE_BOX = "DATE_BOX"
export const TIME_BOX = "TIME_BOX"
export const LOCATION_BOX = "LOCATION_BOX"

const SuggestionsBox = (props) => {
    const [suggestions, setSuggestions] = useState([])
    const { type } = props
    const { left, top } = props.position

    useEffect(() => {
        switch (type) {
            case DATE_BOX:
                setSuggestions(dateSuggestions)
                break;
            case TIME_BOX:
                setSuggestions(timeSuggestions)
                break;
            case LOCATION_BOX:
                setSuggestions(locationSuggestions)
                break
            default:
                return
        }
    }, [type])

    //Date and Time suggestions
    const brMoment = moment().locale("pt-br")
    const enMoment = moment().locale("en")
    const whenIsWeekend = () => {
        const saturday = 6; // for Thursday
        const today = moment().isoWeekday();

        if (today <= 6) {
            return moment().isoWeekday(6).format("DD/MM/YY");
        } else {
            return moment().add(1, 'weeks').isoWeekday(6).format("DD/MM/YY");
        }
    }

    const dateSuggestions = [
        { name: "Today", value: brMoment.format("DD/MM/YY").toString(), icon: ['far', 'calendar-alt'] },
        { name: "Tomorrow", value: brMoment.add(1, "day").format("DD/MM/YY").toString(), icon: ['far', 'calendar-alt'] },
        { name: "This Weekend", value: whenIsWeekend().toString(), icon: ['far', 'calendar-alt'] }
    ]

    const timeSuggestions = [
        { name: "Morning", value: "09:00", icon: ['far', 'clock'] },
        { name: "Noon", value: "12:00", icon: ['far', 'clock']},
        { name: "Afternoon", value: "15:00", icon: ['far', 'clock']},
        { name: "Evening", value: "18:00", icon: ['far', 'clock']},
        { name: "Night", value: "21:00", icon: ['far', 'clock']}
    ]

    const locationSuggestions = [
        { name: "Current Location", value: "221B Baker St, Marylebone, London", icon: "location-arrow" },
        { name: "Work Location", value: "When arriving at work location", icon: "car-alt" },
        { name: "Parent's House", value: "When arriving at parent's house", icon: "car-alt" }
    ]

    return (
        <div className={styles.container} style={{ left: left, top: top + 5 }}>
            <span className={styles.suggestions}>Suggestions</span>

            <div className={styles.itemsSection}>
                {suggestions.map(s => (
                    <div key={s.name} className={styles.itemContainer} style={{minWidth: type === LOCATION_BOX ? 250 : (type === TIME_BOX ? 200 : 0)}} onClick={() => props.suggestionClicked(s.value)}>
                        <Icon icon={s.icon} className={styles.icon} />
                        <div className={styles.itemTextWrapper}>
                            <span className={styles.itemName}>{s.name}</span>
                            <span className={styles.itemValue}>{s.value}</span>
                        </div>
                    </div>
                ))}
                {type === DATE_BOX ? <>
                    <div className={styles.divider}></div>
                    <div className={styles.itemContainer} onClick={() => props.openCalendar()}>
                        <Icon icon={['far', 'calendar-alt']} className={styles.icon} />
                        <div className={styles.itemTextWrapper}>
                            <span className={styles.itemName}>Custom...</span>
                            <span className={styles.itemValue} style={{ fontSize: 11 }}>Use the calendar to pick a date</span>
                        </div>
                    </div></>
                    : null}
            </div>
        </div>
    )
}

export default SuggestionsBox