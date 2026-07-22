import { useState } from "react";

function App() {

  const [student] = useState({

    student: "John Doe",

    cgpa: 8.2,

    attendance: 92,

    weak_subject: "Mathematics",

    strong_subject: "Python",

    tasks: 5,

    completed: 2

  });

  return (

    <div style={{padding:"40px"}}>

      <h1>MentorAI Dashboard</h1>

      <hr/>

      <h2>{student.student}</h2>

      <p>CGPA : {student.cgpa}</p>

      <p>Attendance : {student.attendance}%</p>

      <p>Strong Subject : {student.strong_subject}</p>

      <p>Weak Subject : {student.weak_subject}</p>

      <p>

        Tasks Completed : {student.completed}/{student.tasks}

      </p>

    </div>

  );

}

export default App;