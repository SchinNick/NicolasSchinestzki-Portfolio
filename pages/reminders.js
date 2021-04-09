import { useEffect, useState, useRef } from 'react'
import styles from '../styles/Reminders/Reminders.module.css'
import moment from 'moment'
import { v4 as uuid } from 'uuid'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import Reminder from '../components/Reminders/Reminder'
import List from '../components/Reminders/List'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { wait } from '../globals/functions'
import ListInfo from '../components/Reminders/ListInfo'

const initialLists = [
    {
        id: uuid(),
        name: "Personal",
        icon: "male",
        color: "#1C87FB",
        reminders: [],
        doneReminders: []
    },
    {
        id: uuid(),
        name: "Work",
        icon: "suitcase",
        color: "#FC4741",
        reminders: [],
        doneReminders: []
    },
    {
        id: uuid(),
        name: "Startup",
        icon: "building",
        color: "#FD9E2B",
        reminders: [],
        doneReminders: []
    },
]

const newList = {
    name: "New List",
    icon: "list-ul",
    color: "#1C87FB",
    reminders: [],
    doneReminders: []
}

const emptyReminder = {
    done: false,
    editing: true,
    name: "",
    notes: "",
    dateInfo: "",
    timeInfo: null,
    locationInfo: "",
    flagged: false,
}
export default function Reminders() {
    const wrapperRef = useRef()
    const listInfoRef = useRef()
    const [search, setSearch] = useState('')
    const [lists, setLists] = useState(initialLists)
    const [filteredList, setFilteredList] = useState(null)
    const [activeListIndex, setActiveListIndex] = useState(0)
    const [currentListReminders, setCurrentListReminders] = useState([])
    const [isCreating, setIsCreating] = useState(false)

    //LISTS LOGIC
    useEffect(() => {
        setIsCreating(lists[activeListIndex].reminders.length > 0 ? true : false)
        wait(300).then(() => {
            setCurrentListReminders(lists[activeListIndex].reminders)

        })
    }, [activeListIndex])

    const changeList = (index) => {
        if (index === activeListIndex) {
            return
        }
        let listsCopy = lists
        listsCopy[activeListIndex].reminders = currentListReminders.filter(r => r.name.length > 0)
        setLists(listsCopy)
        setActiveListIndex(index)
        setCurrentListReminders([])
    }

    const addList = () => {
        let listsCopy = lists
        listsCopy[activeListIndex].reminders = currentListReminders.filter(r => r.name.length > 0)
        let index = listsCopy.push({...newList, id: uuid(), new: true}) - 1 
        setLists(listsCopy)
        setActiveListIndex(index)
        setCurrentListReminders([])
    }

    const updateList = (id, content) => {
        console.log(id)
        let listsCopy = lists
        let index = listsCopy.findIndex(l => l.id === id)
        listsCopy[index] = {
            ...listsCopy[index],
            ...content
        }
        setLists([...listsCopy])
    }

    //REMINDERS LOGIC
    const onReminderChange = (id, content, addNewReminder) => {
        let reminders = currentListReminders
        let index = reminders.findIndex(r => r.id === id)
        let removeReminder = false
        if (index !== -1) {
            if (content.done) {
                if (content.name.length > 0) {
                    let listsCopy = lists
                    listsCopy[activeListIndex].doneReminders.push({
                        id: id,
                        ...content
                    })
                    setLists(listsCopy)
                }
                removeReminder = true;
            } else {
                if (content.name.length > 0) {
                    reminders[index] = {
                        id: id,
                        ...content
                    }
                }
            }
            if (removeReminder) {
                reminders = reminders.filter(r => r.id !== id)
                if (reminders.length === 0) {
                    setIsCreating(false)
                }
            }
            if (addNewReminder) addReminder()
            setCurrentListReminders(reminders)
        }
        else {
            return
        }
    }

    const addReminder = () => {
        let emptyCount = currentListReminders.filter(r => r.name.length === 0).length
        if (emptyCount === 0) {
            if (!isCreating) {
                setIsCreating(true)
            }
            wait(currentListReminders.length === 0 ? 100 : 0).then(() => {
                setCurrentListReminders(reminders => [
                    ...reminders,
                    { ...emptyReminder, id: uuid() }
                ])
            })
        } else {
            let validReminders = currentListReminders.filter(r => r.name.length > 0)
            setCurrentListReminders(validReminders)
            return
        }
    }

    const deleteReminder = (id) => {
        let reminders = currentListReminders
        reminders = reminders.filter(r => r.id !== id)
        if (reminders.length === 0) {
            setIsCreating(false)
        }
        setCurrentListReminders(reminders)
    }
    
    const clearEmptyReminders = (activeReminderId) => {
        setCurrentListReminders(reminders => reminders.filter(r => r.name.length > 0 || r.id === activeReminderId))
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Reminders' Clone</h1>
            <div className={styles.wrapper} ref={wrapperRef}>
                <div className={styles.listsContainer}>
                    <div className={styles.macButtons}>
                        <span style={{ backgroundColor: "#FC605C" }}></span>
                        <span style={{ backgroundColor: "#FCBB40" }}></span>
                        <span style={{ backgroundColor: "#34C648" }}></span>
                    </div>
                    <div className={styles.searchWrapper}>
                        <Icon icon="search" color="#fff" style={{ fontSize: 11 }} />
                        <input tabIndex="-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" />
                    </div>
                    <div className={styles.filters}>
                        <div className={styles.filter}>
                            <div className={styles.filterTopRow}>
                                <span className={styles.iconspan} style={{ backgroundColor: "#1C87FB" }}>
                                    <Icon icon={['far', 'calendar']} color="#fff" style={{ fontSize: 13 }} />
                                    <p>{moment().date()}</p>
                                </span>
                                <p>0</p>
                            </div>
                            <p>Today</p>
                        </div>
                        <div className={styles.filter}>
                            <div className={styles.filterTopRow}>
                                <span className={styles.iconspan} style={{ backgroundColor: "#FC4741" }}>
                                    <Icon icon={['far', 'calendar-alt']} color="#fff" style={{ fontSize: 13 }} />
                                </span>
                                <p>0</p>
                            </div>
                            <p>Scheduled</p>
                        </div>
                        <div className={styles.filter}>
                            <div className={styles.filterTopRow}>
                                <span className={styles.iconspan} style={{ backgroundColor: "#5B626A" }}>
                                    <Icon icon="inbox" color="#fff" style={{ fontSize: 13 }} />
                                </span>
                                <p>0</p>
                            </div>
                            <p>All</p>
                        </div>
                        <div className={styles.filter}>
                            <div className={styles.filterTopRow}>
                                <span className={styles.iconspan} style={{ backgroundColor: "#FD9E2B" }}>
                                    <Icon icon="flag" color="#fff" style={{ fontSize: 13 }} />
                                </span>
                                <p>0</p>
                            </div>
                            <p>Flagged</p>
                        </div>
                    </div>
                    <div className={styles.lists}>
                        <p className={styles.listsTitle}>My Lists</p>
                        <div style={{ marginTop: 4 }}>
                            {lists.map((list, index) => (
                                <List key={`${index}_${list.name}`} setActiveListIndex={(i) => changeList(i)} {...list} 
                                    index={index} active={index === activeListIndex} 
                                    reminders={index === activeListIndex ? currentListReminders : list.reminders}
                                    updateList={(i, n) => updateList(i, n)} editListInfo={(id, listInfo) => listInfoRef.current?.show(id, listInfo)} />
                            ))}
                        </div>
                    </div>
                    <span className={styles.addListContainer} onClick={() => addList()}>
                        <span>+</span>
                        Add List
                    </span>
                </div>
                <div className={styles.reminders}>
                    <span className={styles.addReminder} onClick={() => addReminder()}>
                        +
                    </span>
                    <div className={styles.remindersTitleWrapper}>
                        <h1 className={styles.remindersListName} style={{ color: lists[activeListIndex].color }}>
                            {lists[activeListIndex].name}
                        </h1>
                        <span style={{fontSize: 35, fontFamily: "BBAnonymProRegular", color: lists[activeListIndex].color}}>{currentListReminders.length}</span>
                    </div>

                    {!isCreating ?
                        <h2 onClick={() => addReminder()} className={styles.remindersCompleted}></h2>
                        :
                        <div className={styles.remindersWrapper}>
                            <TransitionGroup enter exit>
                                {currentListReminders.map((reminder, index) => (
                                    <CSSTransition key={reminder.id} timeout={200} classNames="reminderAnim">
                                        <Reminder wrapperRef={wrapperRef} color={lists[activeListIndex].color} {...reminder}
                                            onReminderChange={(id, content, addNewReminder) => onReminderChange(id, content, addNewReminder)}
                                            deleteReminder={(id) => deleteReminder(id)}
                                            onReminderClick={(id) => clearEmptyReminders(id)} />
                                    </CSSTransition>))
                                }
                            </TransitionGroup>
                            <div style={{ flex: 1, marginTop: 5 }} onClick={() => addReminder()}>

                            </div>
                        </div>

                    }
                </div>
                <ListInfo ref={listInfoRef} updateList={(id, listInfo) => updateList(id, listInfo)}/>
            </div>
        </div>

    )
}
