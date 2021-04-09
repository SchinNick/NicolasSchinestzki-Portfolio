import Calendar from 'react-calendar'

const CalendarOverride = (props) => {
    const { left, top } = props.position
    return(
        <div style={{position: "absolute", left: left, top: top + 5, transform: "translateX(-30%)" }}>
            <Calendar
                onChange={(value) => props.suggestionClicked(value)}
                showDoubleView={false}/>
        </div>
    )
}

export default CalendarOverride