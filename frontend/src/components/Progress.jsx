import { useMemo, useState } from "react";
import {
  BarElement,
  Filler,
  RadialLinearScale,
} from "chart.js";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import ChartJS from "chart.js/auto";

ChartJS.register(BarElement, RadialLinearScale, Filler);

const WEEKLY_DATA = [
  { week: "Week 1", PDS: 65, ADS: 58, DAA: 50, DBMS: 48, AJP: 72, OOPS: 68 },
  { week: "Week 2", PDS: 68, ADS: 62, DAA: 54, DBMS: 52, AJP: 75, OOPS: 70 },
  { week: "Week 3", PDS: 70, ADS: 67, DAA: 52, DBMS: 50, AJP: 78, OOPS: 73 },
  { week: "Week 4", PDS: 72, ADS: 72, DAA: 55, DBMS: 53, AJP: 80, OOPS: 75 },
  { week: "Week 5", PDS: 73, ADS: 76, DAA: 54, DBMS: 52, AJP: 82, OOPS: 76 },
  { week: "Week 6", PDS: 73, ADS: 80, DAA: 56, DBMS: 54, AJP: 85, OOPS: 77 },
];

const SUBJECT_COLORS = {
  PDS: "#22c55e",
  ADS: "#3b82f6",
  DAA: "#f59e0b",
  DBMS: "#a855f7",
  AJP: "#ef4444",
  OOPS: "#06b6d4",
};

export default function Progress({ dashboard }) {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [timeRange, setTimeRange] = useState("semester");

  const subjectScores = dashboard?.subject_scores || [];
  const trendData = dashboard?.performance_trend || [];

  // Subject-wise bar chart
  const barChartData = useMemo(() => {
    const labels = subjectScores.map((s) => s.subject);
    const scores = subjectScores.map((s) => s.score);
    const colors = labels.map((l) => SUBJECT_COLORS[l] || "#8b5cf6");

    return {
      labels,
      datasets: [
        {
          label: "Score (%)",
          data: scores,
          backgroundColor: colors.map((c) => c + "88"),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Class Average",
          data: labels.map(() => dashboard?.overview?.class_average || 60),
          backgroundColor: "rgba(148, 163, 184, 0.2)",
          borderColor: "rgba(148, 163, 184, 0.5)",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          borderDash: [5, 5],
        },
      ],
    };
  }, [subjectScores, dashboard]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#94a3b8", usePointStyle: true, padding: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: { color: "#94a3b8" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8" },
      },
    },
    animation: { duration: 1000, easing: "easeInOutQuart" },
  };

  // Radar chart for skill assessment
  const radarChartData = useMemo(() => {
    const labels = subjectScores.map((s) => s.subject);
    const scores = subjectScores.map((s) => s.score);

    return {
      labels,
      datasets: [
        {
          label: "Your Score",
          data: scores,
          backgroundColor: "rgba(139, 92, 246, 0.25)",
          borderColor: "#8b5cf6",
          borderWidth: 2,
          pointBackgroundColor: "#8b5cf6",
          pointBorderColor: "#fff",
          pointRadius: 5,
        },
        {
          label: "Class Average",
          data: labels.map(() => dashboard?.overview?.class_average || 60),
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          borderColor: "#f59e0b",
          borderWidth: 2,
          pointBackgroundColor: "#f59e0b",
          pointBorderColor: "#fff",
          pointRadius: 4,
          borderDash: [5, 5],
        },
      ],
    };
  }, [subjectScores, dashboard]);

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#94a3b8", usePointStyle: true, padding: 16 },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(148, 163, 184, 0.15)" },
        angleLines: { color: "rgba(148, 163, 184, 0.15)" },
        pointLabels: { color: "#e2e8f0", font: { size: 12, weight: "600" } },
        ticks: { color: "#94a3b8", backdropColor: "transparent", stepSize: 20 },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" },
  };

  // Weekly progress line data for selected subject
  const weeklySubjectData = useMemo(() => {
    const subjects = selectedSubject === "all"
      ? Object.keys(SUBJECT_COLORS)
      : [selectedSubject];

    return {
      labels: WEEKLY_DATA.map((w) => w.week),
      datasets: subjects.map((subj) => ({
        label: subj,
        data: WEEKLY_DATA.map((w) => w[subj] || 0),
        borderColor: SUBJECT_COLORS[subj],
        backgroundColor: SUBJECT_COLORS[subj] + "22",
        tension: 0.4,
        fill: subjects.length === 1,
        pointRadius: 4,
        pointBackgroundColor: SUBJECT_COLORS[subj],
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      })),
    };
  }, [selectedSubject]);

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#94a3b8", usePointStyle: true, padding: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: { color: "#94a3b8" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8" },
      },
    },
    interaction: { mode: "index", intersect: false },
    animation: { duration: 800, easing: "easeInOutCubic" },
  };

  // Grade distribution doughnut
  const gradeDistribution = useMemo(() => {
    const grades = {};
    subjectScores.forEach((s) => {
      const g = s.grade || "-";
      grades[g] = (grades[g] || 0) + 1;
    });
    return {
      labels: Object.keys(grades),
      datasets: [
        {
          data: Object.values(grades),
          backgroundColor: ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"],
          borderWidth: 0,
        },
      ],
    };
  }, [subjectScores]);

  const avgScore = dashboard?.overview?.average_score || 0;
  const classAvg = dashboard?.overview?.class_average || 0;
  const rank = dashboard?.overview?.rank_in_class || 0;
  const percentile = dashboard?.overview?.class_percentile || 0;
  const streak = dashboard?.overview?.study_streak || 0;

  const improvement = useMemo(() => {
    if (subjectScores.length === 0) return [];
    return subjectScores
      .map((s, i) => {
        const prevWeek = WEEKLY_DATA[WEEKLY_DATA.length - 2]?.[s.subject] || 0;
        const currWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1]?.[s.subject] || 0;
        return { subject: s.subject, change: currWeek - prevWeek, current: currWeek };
      })
      .sort((a, b) => b.change - a.change);
  }, [subjectScores]);

  return (
    <div className="progress-container">
      <div className="progress-header">
        <div>
          <h2>Progress Tracker</h2>
          <p>Visualize your academic growth and performance trends</p>
        </div>
        <div className="progress-time-filter">
          {["week", "month", "semester"].map((r) => (
            <button
              key={r}
              className={`time-btn ${timeRange === r ? "active" : ""}`}
              onClick={() => setTimeRange(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="progress-stats">
        <div className="progress-stat-card">
          <div className="ps-label">Average Score</div>
          <div className="ps-value">{avgScore}%</div>
          <div className={`ps-change ${avgScore >= classAvg ? "positive" : "negative"}`}>
            {avgScore >= classAvg ? "↑" : "↓"} vs class avg ({classAvg}%)
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="ps-label">Class Rank</div>
          <div className="ps-value">#{rank}</div>
          <div className="ps-change positive">Top {percentile}%</div>
        </div>
        <div className="progress-stat-card">
          <div className="ps-label">Study Streak</div>
          <div className="ps-value">{streak} days</div>
          <div className="ps-change positive">🔥 Keep going!</div>
        </div>
        <div className="progress-stat-card">
          <div className="ps-label">Subjects Passed</div>
          <div className="ps-value">{subjectScores.filter((s) => s.score >= 40).length}/{subjectScores.length}</div>
          <div className="ps-change positive">All on track</div>
        </div>
      </div>

      {/* Charts row 1: Bar + Radar */}
      <div className="progress-charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Subject Performance</h3>
            <span className="chart-subtitle">Your scores vs class average</span>
          </div>
          <div className="chart-area">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Skill Radar</h3>
            <span className="chart-subtitle">Balanced performance across subjects</span>
          </div>
          <div className="chart-area">
            <Radar data={radarChartData} options={radarChartOptions} />
          </div>
        </div>
      </div>

      {/* Weekly progress chart */}
      <div className="chart-card full-width">
        <div className="chart-card-header">
          <h3>Weekly Progress</h3>
          <div className="subject-selector">
            <button
              className={`subj-btn ${selectedSubject === "all" ? "active" : ""}`}
              onClick={() => setSelectedSubject("all")}
            >
              All Subjects
            </button>
            {Object.keys(SUBJECT_COLORS).map((subj) => (
              <button
                key={subj}
                className={`subj-btn ${selectedSubject === subj ? "active" : ""}`}
                onClick={() => setSelectedSubject(subj)}
                style={selectedSubject === subj ? { borderColor: SUBJECT_COLORS[subj], color: SUBJECT_COLORS[subj] } : {}}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-area wide">
          <Bar data={weeklySubjectData} options={weeklyChartOptions} type="line" />
        </div>
      </div>

      {/* Charts row 2: Grade distribution + Improvement tracker */}
      <div className="progress-charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Grade Distribution</h3>
            <span className="chart-subtitle">Breakdown of grades across subjects</span>
          </div>
          <div className="chart-area small">
            <Doughnut
              data={gradeDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#94a3b8", usePointStyle: true, padding: 16 },
                  },
                },
                animation: { animateRotate: true, duration: 1200 },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Weekly Improvement</h3>
            <span className="chart-subtitle">Score change from last week</span>
          </div>
          <div className="improvement-list">
            {improvement.map((item) => (
              <div className="improvement-row" key={item.subject}>
                <span className="imp-subject" style={{ color: SUBJECT_COLORS[item.subject] }}>
                  {item.subject}
                </span>
                <div className="imp-bar-wrap">
                  <div
                    className="imp-bar"
                    style={{
                      width: `${Math.min(100, item.current)}%`,
                      background: SUBJECT_COLORS[item.subject],
                    }}
                  />
                </div>
                <span className={`imp-change ${item.change >= 0 ? "positive" : "negative"}`}>
                  {item.change >= 0 ? "+" : ""}{item.change}
                </span>
                <span className="imp-current">{item.current}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
