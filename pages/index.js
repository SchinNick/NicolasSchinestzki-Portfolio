import { useEffect, useState, useRef } from 'react'
import styles from '../styles/Reminders/Reminders.module.css'

import moment from 'moment'
import { v4 as uuid } from 'uuid'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'

import Reminder from '../components/Reminders/Reminder'
import ListInfo from '../components/Reminders/ListInfo'
import List from '../components/Reminders/List'
import Filter from '../components/Reminders/Filter'

const brMoment = moment().locale("pt-br")

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
    const [filterFocused, setFilterFocused] = useState(null)
    const [lists, setLists] = useState([])
    const [activeList, setActiveList] = useState(lists[0])
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        let lists = JSON.parse(localStorage.getItem("lists"))
        setLists(lists)
        setActiveList(lists[0])
    }, [])

    useEffect(() => {
        localStorage.setItem("lists", JSON.stringify(lists.length > 0 ? lists : initialLists))
    }, [lists])

    //LISTS LOGIC
    useEffect(() => {
        if (activeList) {
            //EVERY UPDATE ON ACTIVELIST TRIGGERS AN UPDATE IN LISTS STATE.
            let listsCopy = lists
            let index = lists.findIndex(l => l.id === activeList.id)
            listsCopy[index] = activeList
            setLists([...listsCopy])

            //SET "isCreating" ACCORDINGLY TO ACTIVELIST REMINDERS EXISTENCE 
            setIsCreating(activeList?.reminders.length > 0 ? true : false)
        }

    }, [activeList])

    const changeList = (list) => {
        if (list === activeList) {
            return
        }

        if (filterFocused !== "All") {
            // EVERY TIME ACTIVELIST IS CHANGED NEED TO FILTER REMINDERS THAT ARE VALID
            clearEmptyReminders(null, filterFocused !== null)
        }

        //ACTUALLY CHANGE THE ACTIVELIST
        setActiveList({ ...list })

        //AS THIS FUNCTION SUPPOSES CLICK ON NORMAL LIST, SET FOCUSED FILTER TO NULL, FOR FILTERS STYLE LOGIC
        setFilterFocused(null)
        console.log(filterFocused)
    }


    const addList = () => {
        let listsCopy = lists
        let listToAdd = { ...newList, id: uuid(), new: true }
        listsCopy.push(listToAdd)
        setLists([...listsCopy])
        changeList(listToAdd)
    }

    const updateList = (id, content) => {
        let listsCopy = lists
        let index = listsCopy.findIndex(l => l.id === id)
        listsCopy[index] = {
            ...listsCopy[index],
            ...content
        }
        setLists([...listsCopy])
        setActiveList({ ...listsCopy[index] })
    }

    const deleteList = (id) => {
        let listsCopy = lists
        let index = listsCopy.findIndex(l => l.id === id)
        if (listsCopy.length >= 2) {
            listsCopy = listsCopy.filter(l => l.id !== id)
            setLists([...listsCopy])
            setActiveList({ ...lists[index === 0 ? 1 : 0] })
        }

    }

    // FILTERS LOGIC
    const onTodayClick = () => {
        if (filterFocused !== "All") {
            clearEmptyReminders(null, true)
        }
        setFilterFocused("Today")
        let list = {
            name: "Today",
            color: "#1C87FB",
            reminders: [],
            doneReminders: [],
        }
        lists.forEach(l => {
            l.reminders.forEach(r => {
                if (r.dateInfo === brMoment.format("DD/MM/YY").toString()) {
                    r = { ...r, listName: l.name }
                    list.reminders.push(r)
                }
            })
        })
        setActiveList({ ...list })
    }

    const onScheduledClick = () => {
        if (filterFocused !== "All") {
            clearEmptyReminders(null, true)
        }
        setFilterFocused("Scheduled")
        let list = {
            name: "Scheduled",
            color: "#FC4741",
            dates: [],
            reminders: [],
            doneReminders: [],
        }
        lists.forEach(l => {
            l.reminders.forEach(r => {
                if (r.dateInfo !== "") {
                    r = { ...r, listName: l.name }
                    list.reminders.push(r)

                    // ADDS THE DATE TO AN ARRAY (IF ISN'T ADDED YET) FOR LATER SORT
                    if (!list.dates.includes(r.dateInfo)) {
                        list.dates.push(r.dateInfo)
                    }
                }
            })
        })
        list.dates.sort()
        setActiveList({ ...list })
    }

    const onAllClick = () => {
        setFilterFocused("All")
        clearEmptyReminders(null, true)
        let list = {
            name: "All",
            color: "#5B626A",
            reminders: [0], // puts something here to prevent isCreating going to false
            doneReminders: [],
        }
        setActiveList({ ...list })
    }

    const onFlaggedClick = () => {
        if (filterFocused !== "All") {
            clearEmptyReminders(null, true)
        }
        setFilterFocused("Flagged")

        let list = {
            name: "Flagged",
            color: "#FD9E2B",
            reminders: [],
            doneReminders: [],
        }
        lists.forEach(l => {
            l.reminders.forEach(r => {
                if (r.flagged) {
                    r = { ...r, listName: l.name }
                    list.reminders.push(r)
                }
            })
        })
        setActiveList({ ...list })
    }

    const getTodayCount = () => {
        let count = 0
        lists.forEach(l => {
            count += l.reminders.filter(r => r.dateInfo === brMoment.format("DD/MM/YY").toString()).length
        })
        return count
    }

    const getScheduledCount = () => {
        let count = 0
        lists.forEach(l => {
            count += l.reminders.filter(r => r.dateInfo !== "").length
        })
        return count
    }

    const getAllCount = () => {
        let count = 0
        lists.forEach(l => {
            count += l.reminders.length
        })
        return count
    }

    const getFlaggedCount = () => {
        let count = 0
        lists.forEach(l => {
            count += l.reminders.filter(r => r.flagged === true).length
        })
        return count
    }

    const filters = [
        {
            name: "Today",
            icon: ['far', 'calendar'],
            color: "#1C87FB",
            onClick: onTodayClick,
            count: getTodayCount()
        },
        {
            name: "Scheduled",
            icon: ['far', 'calendar-alt'],
            color: "#FC4741",
            onClick: onScheduledClick,
            count: getScheduledCount()
        },
        {
            name: "All",
            icon: "inbox",
            color: "#5B626A",
            onClick: onAllClick,
            count: getAllCount()
        },
        {
            name: "Flagged",
            icon: "flag",
            color: "#FD9E2B",
            onClick: onFlaggedClick,
            count: getFlaggedCount()
        },
    ]


    //REMINDERS LOGIC
    const onReminderChange = (id, content, addNewReminder) => {
        let list = activeList
        let reminderIndex = list.reminders.findIndex(r => r.id === id)
        let removeReminder = false
        if (reminderIndex !== -1) {
            // IF IS DONE
            if (content.done) {
                // IF IS VALID (NAME !== "")
                if (content.name.length > 0) {
                    list.doneReminders.push({
                        id: id,
                        ...content
                    })
                }
                removeReminder = true;
                console.log("done")
                //NOT DONE BUT VALID
            } else if (content.name.length > 0) {
                list.reminders[reminderIndex] = {
                    id: id,
                    ...content
                }
            }

            if (removeReminder) list.reminders = list.reminders.filter(r => r.id !== id)
            if (addNewReminder) addReminder()

            setActiveList({ ...list })
        }
        else {
            return
        }
    }

    const addReminder = () => {
        let list = activeList
        let emptyCount = list.reminders.filter(r => r.name.length === 0).length
        // IF THERE ISN'T A EMPTY REMINDER, CREATES ONE
        if (emptyCount === 0) {
            list.reminders.push({ ...emptyReminder, id: uuid() })
            setActiveList({ ...list })

            // IF THERE IS ONE, FILTER THE REMINDERS TO HAVE JUST THE VALID ONE'S
        } else {
            clearEmptyReminders(null, true)
        }
    }

    const deleteReminder = (id) => {
        let list = activeList
        list.reminders = list.reminders.filter(r => r.id !== id)
        setActiveList({ ...list })
    }

    const clearEmptyReminders = (exemptReminderId, shouldActOnActualList) => {
        if (shouldActOnActualList) {
            let list = activeList
            list.reminders = list.reminders.filter(r => r.name.length > 0 || r.id === exemptReminderId)
            setActiveList({ ...list })
        } else {
            let listsCopy = lists
            let index = lists.findIndex(l => l.id === activeList.id)
            listsCopy[index].reminders = listsCopy[index].reminders.filter(r => r.name.length > 0 || r.id === exemptReminderId)
            setLists([...listsCopy])
        }
    }

    const dateTranslate = (date) => {
        if (date === moment().format("DD/MM/YY")) {
            return "Today"
        } else if (date === moment().add(1, "days").format("DD/MM/YY")) {
            return "Tomorrow"
        }
        else return <>{moment(date, "DD/MM/YYYY").locale("en").format("ddd").toString()}<span style={{ color: "#7e7d88", marginLeft: 5 }}>{moment(date, "DD/MM/YYYY").locale("en").format("D MMM").toString()}</span></>
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
                        <input tabIndex="-1" value={search} onChange={() => { }} placeholder="Search" />
                    </div>
                    <div className={styles.filters}>
                        {filters.map(f => (
                            <Filter isFocused={f.name === filterFocused} key={f.name} {...f} />
                        ))}
                    </div>
                    <p className={styles.listsTitle}>My Lists</p>
                    <div className={styles.lists}>
                        {lists.map((list, index) => (
                            <List key={`${index}_${list.name}`} setActiveList={() => changeList(list)} {...list}
                                index={index} active={list === activeList}
                                updateList={(id, content) => updateList(id, content)} editListInfo={(id, listInfo) => listInfoRef.current?.show(id, listInfo)}
                                deleteList={(id) => deleteList(id)} />
                        ))}
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
                        <h1 className={styles.remindersListName} style={{ color: activeList?.color }}>
                            {activeList?.name}
                        </h1>
                        {filterFocused !== "All" ? <span style={{ fontSize: 35, fontFamily: "BBAnonymProRegular", color: activeList?.color }}>{activeList?.reminders.length}</span> : null}
                    </div>

                    {!isCreating ?
                        <h2 onClick={() => addReminder()} className={styles.remindersCompleted}>{activeList?.doneReminders.length > 0 ? "All Items Completed" : "No Reminders"}</h2>
                        :
                        <div className={styles.remindersWrapper} style={{ paddingBottom: 30 }}>
                            {filterFocused === null ?
                                <>
                                    <TransitionGroup enter exit>
                                        {activeList.reminders.map(reminder => (
                                            <CSSTransition key={reminder.id} timeout={200} classNames="reminderAnim">
                                                <Reminder wrapperRef={wrapperRef} color={activeList?.color} {...reminder}
                                                    onReminderChange={(id, content, addNewReminder) => onReminderChange(id, content, addNewReminder)}
                                                    deleteReminder={(id) => deleteReminder(id)}
                                                    onReminderClick={(id) => clearEmptyReminders(id, filterFocused !== null)}
                                                    isOnFilter={filterFocused !== null} />
                                            </CSSTransition>))
                                        }
                                    </TransitionGroup>
                                    <div style={{ flex: 1, marginTop: 5 }} onClick={() => addReminder()}>

                                    </div>
                                </> : null}
                            {filterFocused === "All" ?
                                <TransitionGroup enter exit>
                                    {lists.map(l =>
                                    (
                                        <div key={l.name} style={{ marginTop: 20 }}>
                                            <span className={styles.allFilterListName} style={{ color: l.color }}>{l.name}</span>
                                            <div>
                                                {l.reminders.length > 0 ? l.reminders.map(reminder => (
                                                    <CSSTransition key={reminder.id} timeout={200} classNames="reminderAnim">
                                                        <Reminder wrapperRef={wrapperRef} color={activeList?.color} {...reminder}
                                                            onReminderChange={(id, content, addNewReminder) => onReminderChange(id, content, addNewReminder)}
                                                            deleteReminder={(id) => deleteReminder(id)}
                                                            onReminderClick={(id) => clearEmptyReminders(id, filterFocused !== null)}
                                                            isOnFilter={filterFocused !== null} />
                                                    </CSSTransition>
                                                )) : null}
                                                <div className={styles.reminder}>
                                                    <span onClick={() => changeList(l)}>
                                                        <Icon icon="plus" style={{ fontSize: 10, marginTop: 1, marginLeft: 0 }} />
                                                    </span>
                                                    <div className={styles.reminderInfo}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </TransitionGroup>
                                : null}
                            {filterFocused === "Scheduled" ?
                                <TransitionGroup enter exit>
                                    {activeList.dates.map(date =>
                                    (
                                        <div key={date} style={{ marginTop: 20 }}>
                                            <span className={styles.allFilterListName} style={{ color: "#fff" }}>{dateTranslate(date)}</span>
                                            <div>
                                                {activeList.reminders.filter(r => r.dateInfo === date).map(reminder => (
                                                    <CSSTransition key={reminder.id} timeout={200} classNames="reminderAnim">
                                                        <Reminder wrapperRef={wrapperRef} color={activeList?.color} {...reminder}
                                                            onReminderChange={(id, content, addNewReminder) => onReminderChange(id, content, addNewReminder)}
                                                            deleteReminder={(id) => deleteReminder(id)}
                                                            onReminderClick={(id) => clearEmptyReminders(id, filterFocused !== null)}
                                                            isOnFilter={filterFocused !== null} />
                                                    </CSSTransition>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </TransitionGroup>
                                : null}
                        </div>

                    }
                </div>
                <ListInfo ref={listInfoRef} updateList={(id, listInfo) => updateList(id, listInfo)} />
            </div>
        </div>

    )
}
