import { useEffect, useRef, useState } from 'react'
import { isDescendant, wait } from '../../globals/functions'
import styles from '../../styles/Reminders/Reminder.module.css'

import TextareaResize from 'react-autosize-textarea'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { CSSTransition } from 'react-transition-group'
import SuggestionsBox, { DATE_BOX, LOCATION_BOX, TIME_BOX } from './SuggestionsBox'
import moment from 'moment'
import CalendarOverride from './CalendarOverride'

const NAME = "NAME"
const NOTES = "NOTES"
const Reminder = (props) => {
    moment.locale("pt-br")
    const mainInput = useRef(null)

    //Main reminders properties
    const [editing, setEditing] = useState(props.editing)
    const [active, setActive] = useState(false)
    const [done, setDone] = useState(false)
    const [name, setName] = useState(props.name)
    const [notes, setNotes] = useState(props.notes)

    //Advanced info
    const [activeSuggestionBox, setActiveSuggestionBox] = useState(null)
    const [dateInfo, setDateInfo] = useState(props.dateInfo)
    const [timeInfo, setTimeInfo] = useState(props.timeInfo)
    const [locationInfo, setLocationInfo] = useState(props.locationInfo)
    const [flagged, setFlagged] = useState(props.flagged)

    useEffect(() => {
        if (editing) {
            setActive(false)

        }
    }, [editing])

    useEffect(() => {
        if (done) setEditing(false)
        const delay = setTimeout(() => {
            if (done) {
                sendContentToParent(false)
            }
        }, 2000)

        return () => clearTimeout(delay)
    }, [done])

    useEffect(() => {
        if (moment(dateInfo, "DD/MM/YYYY").isValid() && timeInfo === null) {
            setTimeInfo("")
        }
    }, [dateInfo])

    const handleClick = () => {
        props.onReminderClick(props.id)
        setActive(!editing)
    }

    const handleKeyboard = (e) => {
        e.preventDefault()

        if(e.key === "Enter"){
            if(name.length > 0){
                sendContentToParent(true)
            }else{
                props.deleteReminder(props.id)
            }
        }
        if (e.key === "Escape") {
            if(name.length > 0){
                setEditing(false)
                setActive(true)
                sendContentToParent(false)
            }else{
                props.deleteReminder(props.id)
            }      
        }
    }

    const parentHandleKeyboard = (e) => {
        if ((e.key === "Delete" || e.key === "Backspace") && active) {
            props.deleteReminder(props.id)
        } else if (e.key === "Enter" && active) {
            setEditing(true)
            //Needs to wait for editing to be true, so that the reference points to <textarea>
            wait(100).then(() => {
                mainInput.current.select()
            })
        }
    }

    const handleTextArea = (e, field) => {
        if (e.nativeEvent.inputType === "insertLineBreak") return;

        if (field === NAME) {
            setName(e.currentTarget.value)
        } else if (field === NOTES) {
            setNotes(e.currentTarget.value)
        }
    }

    const sendContentToParent = (addNewReminder) => {
        let dateIsValid = moment(dateInfo, "DD/MM/YY").isValid()
        let timeIsValid = moment(timeInfo, "HH:mm").isValid()
        const content = {
            name: name,
            notes: notes,
            flagged: flagged,
            done: done,
            editing: false,
            dateInfo: dateIsValid ? dateInfo : "",
            timeInfo: timeIsValid ? timeInfo : null,
            locationInfo: locationInfo
        }
        props.onReminderChange(props.id, content, addNewReminder)
        setActiveSuggestionBox(null)
        if (!dateIsValid) setDateInfo("") 
        if (!timeIsValid) setTimeInfo(null)
        if (done) return
        setEditing(false)
    }

    const blurHandle = (e) => {
        const target = e.relatedTarget
        const parent = e.currentTarget
        if (!isDescendant(parent, target)) {
            sendContentToParent(false)
            setActive(false)
        }
    }

    const focusHandle = (e) => {
        setEditing(true)
        setActiveSuggestionBox(null)
        var val = e.target.value
        e.target.value = ''
        e.target.value = val
    }

    const openSuggestionBox = (e, type) => {
        const wrapper = props.wrapperRef.current
        const rect = e.currentTarget.getBoundingClientRect()
        let position = {
            top: rect.top + rect.height + window.pageYOffset - wrapper.offsetTop,
            left: rect.left + (rect.width / 2) + window.pageXOffset - wrapper.offsetLeft
        }
        setActiveSuggestionBox({ type, position })
    }

    const handleSuggestionClicked = (value) => {
        switch (activeSuggestionBox?.type) {
            case DATE_BOX:
                setDateInfo(value)
                break;
            case TIME_BOX:
                setTimeInfo(value)
                break;
            case LOCATION_BOX:
                setLocationInfo(value)
                break;
            default:
                return
        }
        setActiveSuggestionBox(null)
    }

    return (
        <div onKeyDown={(e) => parentHandleKeyboard(e)} tabIndex={1} className={styles.reminder} style={{ backgroundColor: active ? "#464145" : "transparent" }} onBlur={(e) => blurHandle(e)} onClick={() => handleClick()} >
            <span onClick={() => setDone(!done)} className={styles.reminderCheck} style={{ borderColor: done ? props.color : (active ? "#7e7a7d" : "#464145") }}>
                <span style={{ backgroundColor: done ? props.color : "transparent" }}></span>
            </span>
            <div className={`${styles.reminderInfo} ${active ? styles.active : ""}`}>
                {editing ?
                    <TextareaResize ref={mainInput} tabIndex={2} value={name} onChange={(e) => handleTextArea(e, NAME)} onFocus={(e) => focusHandle(e)} autoCorrect="false"
                        onKeyDown={(e) => e.key === "Enter" || e.key === "Escape" ? handleKeyboard(e) : null} autoFocus={editing}
                        className={styles.reminderInfoName} style={{ resize: "none" }} />
                    :
                    <>
                        <span onClick={() => setEditing(true)} className={styles.reminderInfoName} style={{ width: "fit-content", marginTop: 8, marginLeft: 2 }}>{name}</span>
                        {flagged ? <Icon icon="flag" color="#FD9E2B" style={{fontSize: 11, position: "absolute", right: 15, top: 11}}/> : null}
                        {notes ? <span className={styles.reminderAdvancedInfoPreview} style={{ fontSize: "8.5pt", marginTop: 3, marginLeft: 1}}>{notes}</span> : null}
                        {dateInfo || locationInfo || props.isOnFilter ?
                            <div className={styles.reminderAdvancedInfoDiv}>
                                {props.isOnFilter ? <span style={{ marginRight: 5 }} className={styles.reminderAdvancedInfoPreview}>{props.listName}</span> : null}
                                {dateInfo && !props.isOnFilter ? <span style={{ marginRight: 5 }} className={styles.reminderAdvancedInfoPreview}>{dateInfo}</span> : null}
                                {timeInfo ? <span style={{ marginRight: 5 }} className={styles.reminderAdvancedInfoPreview}>{timeInfo}</span> : null}
                                {locationInfo ?
                                    <span style={{marginLeft: 3}} className={styles.reminderAdvancedInfoPreview}>
                                        <Icon icon="location-arrow" color="#979696" style={{marginRight: 3, fontSize: 8}} />
                                        <span>{locationInfo}</span>
                                    </span> : null}
                            </div>
                            : null}
                    </>}
                <CSSTransition in={editing} timeout={200} classNames="editing">
                    {editing ?
                        <div style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
                            <TextareaResize onFocus={(e) => focusHandle(e)} tabIndex={3} value={notes} onChange={(e) => setNotes(e.currentTarget.value)} onKeyDown={(e) => e.key === "Enter" || e.key === "Escape" ? handleKeyboard(e) : null} autoCorrect="false"
                                className={styles.reminderInfoNotes} style={{ resize: "none" }} placeholder="Notes" />
                            <div style={{ display: "flex", flexDirection: "row", marginTop: 6, marginBottom: 10 }}>
                                <span className={styles.reminderButton} onFocus={(e) => openSuggestionBox(e, DATE_BOX)}>
                                    <Icon icon={['far', 'calendar-alt']} color={activeSuggestionBox?.type === DATE_BOX ? "#187ce7" : "#979696"} style={{ fontSize: 9.5, marginRight: 8 }} />
                                    <input value={dateInfo} onChange={(e) => setDateInfo(e.currentTarget.value)} placeholder="Add Date" />
                                </span>
                                {timeInfo !== null ?
                                    <span className={styles.reminderButton} onFocus={(e) => openSuggestionBox(e, TIME_BOX)}>
                                        <Icon icon={['far', 'calendar-alt']} color={activeSuggestionBox?.type === TIME_BOX ? "#187ce7" : "#979696"} style={{ fontSize: 9.5, marginRight: 8 }} />
                                        <input value={timeInfo} onChange={(e) => setTimeInfo(e.currentTarget.value)} placeholder="Add Time" />
                                    </span>
                                    : null}
                                <span className={styles.reminderButton} onFocus={(e) => openSuggestionBox(e, LOCATION_BOX)}>
                                    <Icon icon="location-arrow" color={activeSuggestionBox?.type === LOCATION_BOX ? "#187ce7" : "#979696"} style={{ fontSize: 9.5, marginRight: 8 }} />
                                    <input value={locationInfo} onChange={(e) => setLocationInfo(e.currentTarget.value)} placeholder="Add Location"
                                        style={{ minWidth: 90, width: `${locationInfo?.length}ch`, maxWidth: timeInfo === null ? 250 : 150 }} />
                                </span>
                                <span className={styles.reminderButton} onClick={() => setFlagged(!flagged)}>
                                    <Icon icon="flag" color={flagged ? "#FD9E2B" : "#979696"} style={{ fontSize: 10 }} />
                                </span>
                            </div>
                        </div>
                        : <span></span>}
                </CSSTransition>
            </div>
            {activeSuggestionBox !== null && !activeSuggestionBox?.calendar ? <SuggestionsBox openCalendar={() => setActiveSuggestionBox({ ...activeSuggestionBox, calendar: true })} suggestionClicked={(value) => handleSuggestionClicked(value)} {...activeSuggestionBox} /> : null}
            {activeSuggestionBox?.type === DATE_BOX && activeSuggestionBox?.calendar ? <CalendarOverride suggestionClicked={(value) => handleSuggestionClicked(moment(value).format("DD/MM/YY").toString())} position={activeSuggestionBox.position} /> : null}
        </div>
    )
}

export default Reminder