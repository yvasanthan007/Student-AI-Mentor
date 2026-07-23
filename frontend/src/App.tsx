import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import api from './services/api'
import Login from './components/Login'
import Register from './components/Register'
import UploadExcel from './components/UploadExcel'
import Analysis from './components/Analysis'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
)

const navItems = [
  { label: 'Dashboard', icon: '⌂', active: true },
  { label: 'AI Chat', icon: '◌' },
  { label: 'Study Planner', icon: '▣' },
  { label: 'Courses', icon: '▤' },
  { label: 'Assignments', icon: '▥' },
  { label: 'Progress', icon: '▦' },
  { label: 'Career Assistant', icon: '✦' },
  { label: 'Settings', icon: '⚙' },
]

const defaultDashboard = {
  found: false,
  student: null,
  overview: {
    greeting_name: 'Student',
    average_score: 0,
    class_percentile: 0,
    rank_in_class: 0,
    rank_label: 'Top 0%',
    ai_readiness: 0,
    study_streak: 0,
    class_average: 0,
  },
  metrics: {
    overall_performance: 0,
    ai_readiness: 0,
    study_streak: 0,
    rank_in_class: 0,
  },
  subject_scores: [],
  performance_trend: [],
  study_plan: [],
  recommended_for_you: [],
  today_focus: [],
  upcoming_deadlines: [],
  recent_achievements: [],
  class_summary: {
    total_students: 0,
    average_class_score: 0,
    top_subject: '',
    weak_subject: '',
  },
  ai_insight: 'Search by roll number or name to load a student dashboard.',
  right_rail: {
    greeting: 'AI Mentor',
    message: 'Search by roll number or name to load a student dashboard.',
  },
  top_subjects: [],
  bottom_subjects: [],
}

function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const login = useCallback((userData: any, accessToken: string) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return { user, token, login, logout, isAuthenticated: !!token }
}

function DashboardPage({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [query, setQuery] = useState(user?.username || '')
  const [dashboard, setDashboard] = useState(defaultDashboard)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [latestUpload, setLatestUpload] = useState<any>(null)
  const [showUpload, setShowUpload] = useState(false)

  const loadDashboard = async (search = '') => {
    setLoading(true)
    setStatus('')
    try {
      const response = await api.get('/dashboard', {
        params: search ? { query: search } : undefined,
      })
      setDashboard(response.data)
      if (!response.data.found) {
        setStatus(response.data.message || 'No match found.')
      }
    } catch (error) {
      setDashboard(defaultDashboard)
      setStatus((error as any)?.response?.data?.detail || 'Unable to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.username) {
      setQuery(user.username)
      const timer = window.setTimeout(() => {
        void loadDashboard(user.username)
      }, 0)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => {
      void loadDashboard()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [user?.username])

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    await loadDashboard(query.trim())
  }

  const handleUploaded = (data: any) => {
    setLatestUpload(data)
    setShowUpload(false)
    if (data.student_name && data.student_name !== 'Unknown') {
      setQuery(data.student_name)
      loadDashboard(data.student_name)
    }
  }

  const trendChartData = useMemo(
    () => ({
      labels: dashboard.performance_trend.map((item: any) => item.label),
      datasets: [
        {
          label: 'Performance trend',
          data: dashboard.performance_trend.map((item: any) => item.value),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.25)',
          pointBackgroundColor: '#f8fafc',
          pointBorderColor: '#8b5cf6',
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [dashboard.performance_trend]
  )

  const overallChartData = useMemo(() => {
    const score = dashboard.overview.average_score || 0
    return {
      labels: ['Performance', 'Remaining'],
      datasets: [
        {
          data: [score, Math.max(0, 100 - score)],
          backgroundColor: ['#8b5cf6', '#1f2937'],
          borderWidth: 0,
        },
      ],
    }
  }, [dashboard.overview.average_score])

  const quickActions = ['Study Planner', 'AI Chat', 'Ask Doubt', 'Career Guide']

  const subjectBadges = dashboard.top_subjects.length
    ? dashboard.top_subjects
    : ['PDS', 'ADS', 'DAA']

  const displayName = dashboard.student?.name || user?.name || 'Student'
  const firstName = displayName.split(' ')[0]
  const performanceLabel =
    dashboard.overview.average_score >= 85
      ? 'Excellent'
      : dashboard.overview.average_score >= 70
        ? 'Very Good'
        : dashboard.overview.average_score >= 55
          ? 'Good'
          : 'Needs Attention'
  const readinessLabel =
    dashboard.overview.ai_readiness >= 80
      ? 'Excellent'
      : dashboard.overview.ai_readiness >= 65
        ? 'Good'
        : 'Improve'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <div>
            <div className="brand-title">MentorAI</div>
            <div className="brand-subtitle">Your AI Academic Mentor</div>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${item.active ? 'active' : ''}`}
              type="button"
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="profile-card">
          <div className="avatar">{firstName.charAt(0)}</div>
          <div>
            <div className="profile-name">{displayName}</div>
            <div className="profile-meta">{user?.username || ''}</div>
          </div>
        </div>

        <button className="logout-btn" type="button" onClick={onLogout}>
          ↪ Logout
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{dashboard.right_rail.greeting}</h1>
            <p>{dashboard.right_rail.message}</p>
          </div>

          <div className="top-icons">
            <div className="icon-btn badge">
              🔔<span>3</span>
            </div>
            <div className="icon-btn">☼</div>
            <div className="icon-btn">⌄</div>
          </div>
        </header>

        <section className="hero-card panel">
          <div className="hero-copy">
            <p>Enter your Roll No. or Name to get your personalized insights</p>

            <form className="hero-search" onSubmit={handleSearch}>
              <div className="hero-search-input">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Roll No. or Name"
                />
              </div>
              <button
                className="primary-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </form>

            <div className="example-line">
              Example: 24CY001 or ABHIRAJ KUMAR
            </div>
            {status ? <div className="status-line">{status}</div> : null}

            <div className="hero-actions" style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <button
                className="ghost-btn"
                type="button"
                onClick={() => setShowUpload(!showUpload)}
              >
                {showUpload ? 'Close Upload' : 'Upload Excel'}
              </button>
            </div>
          </div>
        </section>

        {showUpload && (
          <UploadExcel onUploaded={handleUploaded} />
        )}

        {latestUpload && (
          <Analysis latestUpload={latestUpload} />
        )}

        <section className="metrics-grid">
          <article className="metric panel">
            <div className="metric-head">
              <span className="metric-icon purple">∿</span>
              <span>Overall Performance</span>
            </div>
            <div className="metric-body">
              <div className="donut-wrap">
                <Doughnut
                  data={overallChartData}
                  options={{
                    cutout: '72%',
                    plugins: { legend: { display: false } },
                  }}
                />
                <div className="donut-center">
                  <strong>{dashboard.overview.average_score}%</strong>
                  <span>{performanceLabel}</span>
                </div>
              </div>
            </div>
          </article>

          <article className="metric panel">
            <div className="metric-head">
              <span className="metric-icon purple">★</span>
              <span>AI Readiness Score</span>
            </div>
            <div className="metric-body">
              <strong className="big-number">
                {dashboard.overview.ai_readiness}
              </strong>
              <span className="muted">/100</span>
              <div className="metric-foot green">{readinessLabel}</div>
              <div className="mini-line">
                <Line
                  data={{
                    labels: ['1', '2', '3', '4', '5', '6'],
                    datasets: [
                      {
                        data: [
                          42, 56, 51, 67, 72, dashboard.overview.ai_readiness,
                        ],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.16)',
                        tension: 0.35,
                        fill: true,
                        pointRadius: 0,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { display: false } },
                  }}
                />
              </div>
            </div>
          </article>

          <article className="metric panel">
            <div className="metric-head">
              <span className="metric-icon orange">🔥</span>
              <span>Study Streak</span>
            </div>
            <div className="metric-body">
              <strong className="big-number">
                {dashboard.overview.study_streak}
              </strong>
              <span className="muted">Days</span>
              <div className="metric-foot purple">Keep it up!</div>
            </div>
          </article>

          <article className="metric panel">
            <div className="metric-head">
              <span className="metric-icon yellow">🏆</span>
              <span>Rank in Class</span>
            </div>
            <div className="metric-body">
              <strong className="big-number">
                Top {dashboard.overview.class_percentile}%
              </strong>
              <div className="metric-foot purple">You're doing great!</div>
            </div>
          </article>
        </section>

        <section className="content-grid">
          <div className="main-column">
            <section className="panel subject-panel">
              <div className="panel-head">
                <div>
                  <h3>Subject Performance</h3>
                </div>
                <button type="button" className="ghost-btn">
                  View All
                </button>
              </div>
              <div className="subject-list">
                {subjectBadges.map((subjectName: string) => {
                  const subject =
                    dashboard.subject_scores.find(
                      (item: any) => item.subject === subjectName
                    ) || { subject: subjectName, score: 0 }

                  return (
                    <div className="subject-row" key={subject.subject}>
                      <div className="subject-name">
                        <span
                          className={`subject-dot ${subject.subject.toLowerCase()}`}
                        >
                          {subject.subject.charAt(0)}
                        </span>
                        <span>{subject.subject}</span>
                      </div>
                      <div className="subject-bar">
                        <div
                          className="subject-fill"
                          style={{
                            width: `${Math.min(100, subject.score)}%`,
                          }}
                        />
                      </div>
                      <div className="subject-score">{subject.score}%</div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="panel trend-panel">
              <div className="panel-head">
                <div>
                  <h3>Performance Trend</h3>
                </div>
                <button type="button" className="ghost-btn">
                  This Month
                </button>
              </div>
              <div className="chart-box">
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(148, 163, 184, 0.12)' },
                        ticks: { color: '#94a3b8' },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' },
                      },
                    },
                  }}
                />
              </div>
            </section>

            <section className="bottom-grid">
              <article className="panel insight-panel">
                <h3>AI Insights</h3>
                <p>{dashboard.ai_insight}</p>
                <button className="ghost-btn" type="button">
                  View Detailed Analysis →
                </button>
              </article>

              <article className="panel focus-panel">
                <div className="panel-head">
                  <h3>Today's Focus</h3>
                </div>
                <ul>
                  {dashboard.today_focus.map((item: string, index: number) => (
                    <li key={index}>
                      <span className="focus-bullet" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="progress-caption">
                  0 / {dashboard.today_focus.length} Completed
                  <span className="progress-ring">0%</span>
                </div>
              </article>

              <article className="panel recommend-panel">
                <div className="panel-head">
                  <h3>Recommended For You</h3>
                </div>
                <ul>
                  {dashboard.recommended_for_you.map((item: string, index: number) => (
                    <li key={index}>
                      <span className="rec-icon">⬢</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </div>

          <aside className="right-column">
            <section className="panel ai-mentor-card">
              <div className="mentor-head">
                <div className="mentor-icon">🤖</div>
                <div>
                  <h3>AI Mentor</h3>
                  <p>Your personal academic mentor</p>
                </div>
              </div>
              <div className="mentor-message">
                <h4>{dashboard.right_rail.greeting}</h4>
                <p>{dashboard.right_rail.message}</p>
                <button className="primary-btn" type="button">
                  Ask Anything →
                </button>
              </div>
            </section>

            <section className="panel quick-actions-panel">
              <h3>Quick Actions</h3>
              <div className="quick-grid">
                {quickActions.map((item) => (
                  <button key={item} type="button" className="quick-btn">
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="panel deadlines-panel">
              <div className="panel-head">
                <h3>Upcoming Deadlines</h3>
                <button type="button" className="ghost-btn">
                  View All
                </button>
              </div>
              <div className="deadline-list">
                {dashboard.upcoming_deadlines.map((item: any, index: number) => (
                  <div className="deadline-item" key={index}>
                    <div className="deadline-icon">📅</div>
                    <div>
                      <div className="deadline-title">{item.title}</div>
                      <div className={`deadline-when ${item.flag}`}>
                        {item.when}
                      </div>
                    </div>
                    <span className={`deadline-dot ${item.flag}`} />
                  </div>
                ))}
              </div>
            </section>

            <section className="panel achievements-panel">
              <div className="panel-head">
                <h3>Recent Achievements</h3>
                <button type="button" className="ghost-btn">
                  View All
                </button>
              </div>
              <div className="achievement-list">
                {dashboard.recent_achievements.map((item: any, index: number) => (
                  <div className="achievement-item" key={index}>
                    <span className="achievement-icon">⬤</span>
                    <div>
                      <div className="achievement-title">{item.title}</div>
                      <div className="achievement-when">{item.when}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}

function App() {
  const auth = useAuth()
  const navigate = useNavigate()

  const handleLoginSuccess = (userData: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      auth.login(userData, token)
    }
    navigate('/')
  }

  const handleLogout = () => {
    auth.logout()
    navigate('/login')
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => navigate('/register')}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Register
              onRegisterSuccess={handleLoginSuccess}
              onSwitchToLogin={() => navigate('/login')}
            />
          )
        }
      />
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <DashboardPage user={auth.user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
