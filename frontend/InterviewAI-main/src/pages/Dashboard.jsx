import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Users,
  ClipboardList,
  Star,
  CheckCircle2,
  Menu,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import Sidebar, { T, FONT, useSidebarWidth } from "../components/Sidebar";
import useDashboard from "../hooks/useDashboard";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      *{margin:0;padding:0;box-sizing:border-box}
      html,body,#root{height:100%}
      body{font-family:${FONT};background:${T.bg};color:${T.navy0};overflow:auto}

      ::-webkit-scrollbar{width:6px;height:6px}
      ::-webkit-scrollbar-thumb{background:${T.navy6};border-radius:999px}

      .dashboard-scroll{height:100vh;overflow-y:auto;overflow-x:hidden}

      /* card hover */
      .card-hover{transition:transform .22s ease,box-shadow .22s ease}
      .card-hover:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(0,0,0,.07)}

      /* responsive grids */
      .grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
      .grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}

      @media(max-width:1200px){.grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:640px){.grid-4{grid-template-columns:1fr}}
      @media(max-width:900px){.grid-2{grid-template-columns:1fr}}

      @media(max-width:700px){
        .dash-main{padding:12px !important}
        .dash-header{padding:0 12px !important}
        .dash-title{font-size:20px !important}
      }

      /* skeleton pulse */
      @keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.4}}
      .skeleton{
        background:${T.navy7};
        border-radius:10px;
        animation:skeleton-pulse 1.5s ease-in-out infinite;
      }

      /* chart tooltip */
      .recharts-tooltip-wrapper{outline:none}

      /* table */
      .candidate-table{width:100%;border-collapse:collapse;min-width:600px}
      .candidate-table th{
        font-size:11px;font-weight:700;text-transform:uppercase;
        color:${T.navy4};padding:10px 14px;text-align:left;
        border-bottom:2px solid ${T.navy7};
      }
      .candidate-table td{
        padding:13px 14px;border-top:1px solid ${T.navy8};
        font-size:14px;vertical-align:middle;
      }
      .candidate-table tbody tr:hover{background:${T.bg}}

      /* status pills */
      .pill{
        display:inline-block;padding:4px 10px;border-radius:999px;
        font-size:12px;font-weight:700;
      }
      .pill-selected{background:#ECFDF5;color:#059669}
      .pill-rejected{background:#FEF2F2;color:#DC2626}
      .pill-pending{background:#FFFBEB;color:#D97706}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

/* ─── ANIMATED COUNTER ───────────────────────────────────────────── */
function useCounter(value = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value || 0);
    const duration = 900;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { start = end; clearInterval(timer); }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return Number.isInteger(value) ? Math.round(count) : count.toFixed(1);
}

/* ─── SKELETON COMPONENTS ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      background: T.white, borderRadius: 20, padding: 22,
      border: `1px solid ${T.navy7}`, minHeight: 130,
    }}>
      <div className="skeleton" style={{ width: 100, height: 11, marginBottom: 14 }} />
      <div className="skeleton" style={{ width: 80, height: 34, marginBottom: 14 }} />
      <div className="skeleton" style={{ width: 120, height: 12 }} />
    </div>
  );
}

function SkeletonChart({ height = 320 }) {
  return (
    <div style={{
      background: T.white, borderRadius: 20, padding: 22,
      border: `1px solid ${T.navy7}`, minHeight: height,
    }}>
      <div className="skeleton" style={{ width: 160, height: 24, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 120, height: 12, marginBottom: 22 }} />
      <div className="skeleton" style={{ width: "100%", height: height - 90, borderRadius: 12 }} />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div style={{ background: T.white, borderRadius: 20, padding: 22, border: `1px solid ${T.navy7}` }}>
      <div className="skeleton" style={{ width: 200, height: 22, marginBottom: 18 }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "center" }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
          {[140, 100, 100, 60, 50].map((w, j) => (
            <div key={j} className="skeleton" style={{ width: w, height: 14, borderRadius: 6 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── CUSTOM CHART TOOLTIP ───────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.navy7}`,
      borderRadius: 12, padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,.08)", fontSize: 13,
    }}>
      {label && <div style={{ color: T.navy4, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name ? `${p.name}: ` : ""}{p.value}
        </div>
      ))}
    </div>
  );
}

/* ─── KPI STAT CARD ──────────────────────────────────────────────── */
function StatCard({ title, value, icon: Icon, color, bg, trend, up = true }) {
  const count = useCounter(value);
  return (
    <div className="card-hover" style={{
      background: T.white, borderRadius: 20, padding: 22,
      border: `1px solid ${T.navy7}`, position: "relative", overflow: "hidden",
    }}>
      {/* Subtle background accent */}
      <div style={{
        position: "absolute", right: -20, top: -20,
        width: 100, height: 100, borderRadius: "50%",
        background: bg, opacity: 0.5,
      }} />

      <div style={{
        width: 44, height: 44, borderRadius: 14, background: bg,
        display: "grid", placeItems: "center",
        position: "absolute", right: 18, top: 18,
      }}>
        <Icon size={18} color={color} />
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: T.navy4, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
        {title}
      </div>

      <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, lineHeight: 1 }}>
        {count}
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}>
        {up
          ? <TrendingUp size={13} color={T.success} />
          : <TrendingDown size={13} color={T.error} />}
        <span style={{ color: up ? T.success : T.error, fontWeight: 700 }}>{trend}</span>
        <span style={{ color: T.navy5 }}>vs last month</span>
      </div>
    </div>
  );
}

/* ─── RADAR CHART (Department Skills Overview) ───────────────────── */
function DeptRadarChart({ dept = [], interview = [] }) {
  // Merge dept hiring + interview counts into a radar shape per department
  const deptMap = {};
  (Array.isArray(dept) ? dept : []).forEach(d => {
    deptMap[d.label] = { dept: Number(d.value || 0), interview: 0 };
  });
  (Array.isArray(interview) ? interview : []).forEach(d => {
    if (deptMap[d.label]) deptMap[d.label].interview = Number(d.value || 0);
    else deptMap[d.label] = { dept: 0, interview: Number(d.value || 0) };
  });

  const data = Object.entries(deptMap).map(([name, v]) => ({
    subject: name,
    Hiring: v.dept,
    Interviews: v.interview,
  }));

  const hasData = data.length > 0 && data.some(d => d.Hiring > 0 || d.Interviews > 0);

  return (
    <div className="card-hover" style={{
      background: T.white, borderRadius: 20, padding: 22,
      border: `1px solid ${T.navy7}`,
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Dept. Overview</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 20 }}>Hiring demand vs interviews per department</div>

      {!hasData ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: T.navy4 }}>No department data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke={T.navy7} />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: T.navy4 }} />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: T.navy5 }} axisLine={false} />
            <Radar name="Hiring" dataKey="Hiring" stroke={T.primary} fill={T.primary} fillOpacity={0.25} strokeWidth={2} />
            <Radar name="Interviews" dataKey="Interviews" stroke={T.cyan} fill={T.cyan} fillOpacity={0.2} strokeWidth={2} />
            <Legend iconType="circle" iconSize={9} formatter={v => <span style={{ fontSize: 12, color: T.navy3 }}>{v}</span>} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ─── DONUT / PIE CHART ──────────────────────────────────────────── */
const DONUT_COLORS = [T.primary, "#06B6D4", "#EC4899", "#10B981", "#F59E0B"];

function DonutChart({ data = [] }) {
  const safe = Array.isArray(data)
    ? data.filter(d => d && d.label !== undefined && d.value !== undefined)
    : [];
  const mapped = safe.map(d => ({ name: String(d.label), value: Number(d.value || 0) }));
  const total = mapped.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card-hover" style={{
      background: T.white, borderRadius: 20, padding: 22,
      border: `1px solid ${T.navy7}`,
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Final Decisions</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 20 }}>Outcome distribution</div>

      {!mapped.length || total === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: T.navy4 }}>
          No decision data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={mapped} cx="50%" cy="45%"
              innerRadius="52%" outerRadius="72%"
              dataKey="value" paddingAngle={3}
              label={false}
            >
              {mapped.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle" iconSize={10}
              formatter={(value) => (
                <span style={{ fontSize: 12, color: T.navy3 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ─── BAR CHART ──────────────────────────────────────────────────── */
function ReBarChart({ title, subtitle, data = [], color = T.primary }) {
  const safe = Array.isArray(data) ? data : [];
  const mapped = safe.map(d => ({ name: d.label, value: Number(d.value || 0) }));

  return (
    <div className="card-hover" style={{
      background: T.white, borderRadius: 20, padding: 22,
      border: `1px solid ${T.navy7}`,
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 20 }}>{subtitle}</div>

      {!mapped.length ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: T.navy4 }}>No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={mapped} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke={T.navy8} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.navy4 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: T.navy4 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${color}14` }} />
            <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ─── CANDIDATE TABLE ────────────────────────────────────────────── */
function statusPill(decision) {
  const d = (decision || "").toLowerCase();
  if (d === "selected") return <span className="pill pill-selected">Selected</span>;
  if (d === "rejected") return <span className="pill pill-rejected">Rejected</span>;
  return <span className="pill pill-pending">Pending</span>;
}

function CandidateTable({ rows = [] }) {
  const safe = Array.isArray(rows) ? rows : [];
  function score(exp) { return Math.min(95, 60 + exp * 7); }

  return (
    <div className="card-hover" style={{
      background: T.white, borderRadius: 20, padding: 22,
      border: `1px solid ${T.navy7}`, overflowX: "auto",
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 18 }}>Recent Candidates</div>

      {!safe.length ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: T.navy4 }}>
          No candidates to display
        </div>
      ) : (
        <table className="candidate-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Role Applied</th>
              <th>Department</th>
              <th>Experience</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {safe.slice(0, 8).map((row) => (
              <tr key={row.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: `linear-gradient(135deg,${T.primary},${T.cyan})`,
                      display: "grid", placeItems: "center",
                      color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {(row.full_name || "?")[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{row.full_name}</span>
                  </div>
                </td>
                <td style={{ color: T.navy3 }}>{row.role_applied}</td>
                <td style={{ color: T.navy3 }}>{row.department}</td>
                <td>{row.experience_years} yrs</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      height: 6, width: 60, borderRadius: 999,
                      background: T.navy8, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 999,
                        width: `${score(row.experience_years)}%`,
                        background: T.primary,
                      }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{score(row.experience_years)}%</span>
                  </div>
                </td>
                <td>{statusPill(row.final_decision)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ─── MAIN DASHBOARD PAGE ────────────────────────────────────────── */
export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const SW = useSidebarWidth(collapsed);
  const { loading, error, data } = useDashboard();

  const summary = data?.summary || {};
  const weekly = data?.weeklyTrend || [];
  const pie = data?.decisionPie || [];
  const interview = data?.interviewStatus || [];
  const dept = data?.departmentBar || [];
  const candidates = data?.candidates || [];

  return (
    <>
      <GlobalStyles />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="dashboard-scroll" style={{ marginLeft: SW, transition: ".25s ease" }}>
        {/* ── HEADER ── */}
        <div
          className="dash-header"
          style={{
            height: 68,
            background: T.white,
            borderBottom: `1px solid ${T.navy7}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ border: "none", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="dash-title" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>
                Dashboard
              </div>
              <div style={{ fontSize: 12, color: T.navy4 }}>Recruiter analytics overview</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button style={{
              border: "none", background: T.bg, cursor: "pointer",
              width: 38, height: 38, borderRadius: 10,
              display: "grid", placeItems: "center",
            }}>
              <Search size={16} color={T.navy3} />
            </button>
            <button style={{
              border: "none", background: T.bg, cursor: "pointer",
              width: 38, height: 38, borderRadius: 10,
              display: "grid", placeItems: "center", position: "relative",
            }}>
              <Bell size={16} color={T.navy3} />
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                background: T.error, border: `2px solid ${T.white}`,
              }} />
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="dash-main" style={{ padding: 24, display: "grid", gap: 22 }}>

          {/* KPI CARDS */}
          <div className="grid-4">
            {loading ? (
              [0, 1, 2, 3].map(i => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard title="Total Candidates" value={summary.total_candidates} icon={Users} color={T.primary} bg="#EEF2FF" trend="+12%" up />
                <StatCard title="Completed Interviews" value={summary.interviews_completed} icon={ClipboardList} color={T.cyan} bg="#ECFEFF" trend="+8%" up />
                <StatCard title="Avg MCQ Score" value={summary.avg_mcq_score} icon={Star} color={T.pink} bg="#FDF2F8" trend="+5%" up />
                <StatCard title="Selected" value={summary.total_selected} icon={CheckCircle2} color="#10B981" bg="#ECFDF5" trend="+3%" up />
              </>
            )}
          </div>

          {/* CHARTS ROW 1 */}
          <div className="grid-2">
            {loading ? (
              [0, 1].map(i => <SkeletonChart key={i} height={320} />)
            ) : (
              <>
                <DeptRadarChart dept={dept} interview={interview} />
                <DonutChart data={pie} />
              </>
            )}
          </div>

          {/* CHARTS ROW 2 */}
          <div className="grid-2">
            {loading ? (
              [0, 1].map(i => <SkeletonChart key={i} height={320} />)
            ) : (
              <>
                <ReBarChart title="Interview Status" subtitle="Pipeline breakdown" data={interview} color={T.cyan} />
                <ReBarChart title="Department Hiring" subtitle="Demand by department" data={dept} color={T.pink} />
              </>
            )}
          </div>

          {/* CANDIDATE TABLE */}
          {loading ? <SkeletonTable /> : <CandidateTable rows={candidates} />}

          {/* ERROR STATE */}
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 16, padding: "20px 24px", color: "#DC2626",
              fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}