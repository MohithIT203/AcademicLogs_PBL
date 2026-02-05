import { useState } from "react";
import "./AttendanceCalendar.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


const attendance = {
  "2026-10-03": "present",
  "2026-10-04": "present",
  "2026-10-05": "absent",
  "2026-10-06": "late",
  "2026-10-07": "present",
};

const AttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7; 

  const changeMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const renderDays = () => {
    const cells = [];

  
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const status = attendance[dateKey];

      cells.push(
        <div key={day} className={`day ${status || ""}`}>
          <span className="number">{day}</span>
          {status && <span className="label">{status}</span>}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}>‹</button>
        <h2>{months[month]} {year}</h2>
        <button onClick={() => changeMonth(1)}>›</button>
      </div>

      <div className="weekdays">
        {weekdays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {renderDays()}
      </div>

      <div className="legend">
        <span><i className="dot present"></i> Present</span>
        <span><i className="dot absent"></i> Absent</span>
        <span><i className="dot late"></i> Late</span>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
