import UploadExcel from "./components/UploadExcel";
import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  if (!data)
    return <h1>Loading...</h1>;

  return (
    <div style={{ padding: 40 }}>
      <h1>MentorAI Dashboard</h1>

      {/* Upload UI */}
      <UploadExcel />

      <hr />

      <h2>{data.student}</h2>

      <p>CGPA : {data.cgpa}</p>

      <p>Attendance : {data.attendance}%</p>

      <p>Weak Subject : {data.weak_subject}</p>

      <p>Strong Subject : {data.strong_subject}</p>

      <p>
        Tasks Completed : {data.completed}/{data.tasks}
      </p>
    </div>
  );
}

export default App;