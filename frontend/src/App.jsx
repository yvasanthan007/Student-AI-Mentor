import "./App.css";
import UploadExcel from "./components/UploadExcel";
import Analysis from "./components/Analysis";

function App() {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🎓 MentorAI Dashboard</h1>

      <p>
        AI Student Mentor for LMS Performance Analysis and Personalized Study
        Planning.
      </p>

      <hr />

      <UploadExcel />

      <hr />

      <Analysis />
    </div>
  );
}

export default App;