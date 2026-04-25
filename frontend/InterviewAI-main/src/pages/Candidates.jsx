import { useState, useEffect, useMemo } from "react";
import {
  Search, Filter, Download, ChevronDown,
  Clock, CheckCircle2, AlertCircle, XCircle,
  ArrowUpRight, Bell, Menu,
  ThumbsUp, MinusCircle, ThumbsDown, FileText, X,
  RefreshCw, User,
} from "lucide-react";

import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";
import { api } from "../services/api";

/* ─── CONSTANTS ──────────────────────────────────────────────────── */
const STATUSES = ["All", "Scheduled", "In Progress", "Completed", "Escalated", "Rejected"];

const STATUS_CONFIG = {
  "Scheduled":   { bg: "#E8E5FF", color: "#5929D0", icon: Clock },
  "In Progress": { bg: "#FEF3C7", color: "#D97706", icon: AlertCircle },
  "Completed":   { bg: "#DCFCE7", color: "#16A34A", icon: CheckCircle2 },
  "Escalated":   { bg: "#CFFAFE", color: "#0891B2", icon: ArrowUpRight },
  "Rejected":    { bg: "#FEE2E2", color: "#DC2626", icon: XCircle },
};

const REC_CONFIG = {
  "Proceed":  { bg: "#DCFCE7", color: "#16A34A" },
  "On Hold":  { bg: "#FEF3C7", color: "#D97706" },
  "Reject":   { bg: "#FEE2E2", color: "#DC2626" },
};

const AVATAR_COLORS = [
  "#5929D0","#CF008B","#22D3EE","#F59E0B",
  "#10B981","#6366F1","#EC4899","#0EA5E9","#F97316","#14B8A6",
];

/* ─── HELPERS ────────────────────────────────────────────────────── */
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Normalise any backend shape → consistent UI shape */
function mergeCandidateData(candidates = [], assessments = [], interviews = [], decisions = [], outputs = [], feedback = []) {
  if (!candidates || candidates.length === 0) return [];
  
  return candidates.map((base, idx) => {
    // Find matching records across all endpoints
    const matchKey = (record) => {
      if (!record) return false;
      return (record.email && base.email && record.email === base.email) ||
             (record.candidate_id && record.candidate_id === base.id) ||
             (record.candidate_id && record.candidate_id === base.candidate_id) ||
             (record.id && record.id === base.id) ||
             (record.candidate_id === base.email) ||
             (base.email && record.email === base.email);
    };
    
    const assessment = assessments.find(matchKey) || {};
    const interview = interviews.find(matchKey) || {};
    const decision = decisions.find(matchKey) || {};
    const output = outputs.find(matchKey) || {};
    const hrFb = feedback.find(matchKey) || {};
    
    // Merge all data
    const merged = { ...base, ...assessment, ...interview, ...decision, ...output, ...hrFb };
    return normalizeCandidate(merged, idx);
  });
}

function normalizeCandidate(c, idx) {
  // Extract score (priority: mcq_score, score, assessment_score, total_score)
  let score = null;
  if (c.mcq_score != null) score = Number(c.mcq_score);
  else if (c.score != null) score = Number(c.score);
  else if (c.assessment_score != null) score = Number(c.assessment_score);
  else if (c.total_score != null) score = Number(c.total_score);
  
  // Extract AI recommendation
  let rec = c.ai_recommendation || c.recommendation || c.final_recommendation || c.ai_decision || null;
  if (rec) {
    const rl = rec.toLowerCase();
    if (rl.includes("proceed") || rl.includes("select") || rl.includes("accept") || rl.includes("strong hire") || rl.includes("proceed to interview")) 
      rec = "Proceed";
    else if (rl.includes("hold") || rl.includes("wait") || rl.includes("maybe") || rl.includes("on hold")) 
      rec = "On Hold";
    else if (rl.includes("reject") || rl.includes("no hire") || rl.includes("decline") || rl.includes("reject")) 
      rec = "Reject";
    else rec = null;
  }
  
  // Extract status
  let status = c.interview_status || c.status || c.current_status || c.candidate_status || "Scheduled";
  const sl = status.toLowerCase();
  if (sl.includes("progress") || sl.includes("ongoing") || sl.includes("in_progress")) status = "In Progress";
  else if (sl.includes("complet") || sl.includes("done") || sl.includes("finished") || sl.includes("completed")) status = "Completed";
  else if (sl.includes("escalat") || sl.includes("escalated")) status = "Escalated";
  else if (sl.includes("reject") || sl.includes("rejected")) status = "Rejected";
  else if (sl.includes("scheduled") || sl.includes("pending") || sl.includes("not started")) status = "Scheduled";
  
  // Extract name
  const name = c.full_name || c.name || c.candidate_name || c.applicant_name || "Unknown";
  
  // Extract role
  const role = c.role_applied || c.role || c.position || c.job_title || "—";
  
  // Extract department
  const department = c.department || c.dept || c.team || "—";
  
  // Extract date
  const scheduled = c.interview_date || c.scheduled_date || c.created_at || c.date || c.application_date || "—";
  // Format date nicely if it's a string
  let formattedScheduled = scheduled;
  if (scheduled !== "—" && typeof scheduled === "string") {
    if (scheduled.includes("T")) formattedScheduled = scheduled.split("T")[0];
    else if (scheduled.includes(" ")) formattedScheduled = scheduled.split(" ")[0];
    else formattedScheduled = scheduled;
  }
  
  // Extract session info
  const sessionId = c.session_id || c.sessionId || c.interview_session_id || `SES-${4420 + idx + 1}`;
  
  // Extract experience
  let experience = null;
  if (c.experience_years != null) experience = c.experience_years;
  else if (c.years_experience != null) experience = c.years_experience;
  else if (c.experience != null) experience = c.experience;
  
  // Extract strengths and areas
  let strengths = c.strengths || c.key_strengths || null;
  let areasToProbe = c.areas_to_probe || c.improvement_areas || c.weaknesses || null;
  let summaryText = c.ai_summary || c.summary || c.evaluation_summary || null;
  
  // If strengths/areas are strings, try to parse them
  if (strengths && typeof strengths === "string") {
    try { strengths = JSON.parse(strengths); } catch(e) { strengths = [strengths]; }
  }
  if (areasToProbe && typeof areasToProbe === "string") {
    try { areasToProbe = JSON.parse(areasToProbe); } catch(e) { areasToProbe = [areasToProbe]; }
  }
  
  return {
    id: c.id || c.candidate_id || c._id || `C-${String(idx + 1).padStart(3, "0")}`,
    name,
    role,
    department,
    score,
    status,
    rec,
    scheduled: formattedScheduled,
    sessionId,
    experience,
    email: c.email || null,
    strengths,
    areasToProbe,
    summaryText,
    ini: getInitials(name),
    color: getAvatarColor(name),
  };
}

/* ─── GLOBAL STYLES ──────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      *{margin:0;padding:0;box-sizing:border-box}
      html,body,#root{height:100%}
      body{font-family:${FONT};background:${T.bg};color:${T.navy0};overflow:auto}
      ::-webkit-scrollbar{width:6px;height:6px}
      ::-webkit-scrollbar-thumb{background:${T.navy6};border-radius:999px}

      .filter-pill{padding:6px 14px;border-radius:20px;border:none;cursor:pointer;font-family:${FONT};font-size:12px;font-weight:600;transition:all .15s}
      .filter-pill.active{background:${T.primary};color:#fff}
      .filter-pill.inactive{background:${T.navy8};color:${T.navy3}}
      .filter-pill.inactive:hover{background:${T.navy7};color:${T.navy1}}

      .action-btn{border:none;border-radius:6px;padding:5px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;font-family:${FONT};transition:opacity .15s}
      .action-btn:hover{opacity:.8}

      .cand-tr{transition:background .1s;cursor:default}
      .cand-tr:hover{background:${T.bg} !important}

      @keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
      .modal-box{animation:modalIn .22s ease forwards}

      @keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.4}}
      .skeleton{background:${T.navy7};border-radius:8px;animation:skeleton-pulse 1.5s ease-in-out infinite}

      @media(max-width:700px){.page-main{padding:14px !important}.stat-pills{gap:8px !important}}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

/* ─── REPORT MODAL ───────────────────────────────────────────────── */
function ReportModal({ candidate: c, onClose }) {
  if (!c) return null;
  const scoreColor = c.score >= 85 ? "#16A34A" : c.score >= 70 ? "#D97706" : "#DC2626";

  function handleExport() {
    const lines = [
      `Evaluation Report — ${c.name}`,
      `ID: ${c.id} | Role: ${c.role} | Dept: ${c.department} | Session: ${c.sessionId}`,
      `Score: ${c.score ?? "N/A"} | AI Recommendation: ${c.rec ?? "Pending"} | Status: ${c.status}`,
      `Scheduled: ${c.scheduled}`,
      "",
      "STRENGTHS:",
      ...(c.strengths || [
        "Strong technical fundamentals and problem-solving ability",
        "Clear, well-structured communication throughout",
        "Proactively considered edge cases and trade-offs",
      ]).map(s => `  • ${s}`),
      "",
      "AREAS TO PROBE IN FINAL ROUND:",
      ...(c.areasToProbe || [
        "Could go deeper on system-design scalability trade-offs",
      ]).map(s => `  • ${s}`),
      "",
      "AI RECOMMENDATION SUMMARY:",
      c.summaryText || (
        c.rec === "Proceed"
          ? "Proceed — Strong technical fundamentals. Recommended for final round with focus on system design."
          : c.rec === "On Hold"
          ? "Hold — Shows potential but needs improvement. Consider re-evaluation after upskilling."
          : "Reject — Does not meet the required technical bar for this position."
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `report_${c.id}.txt`;
    a.click();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}
      onClick={onClose}
    >
      <div
        className="modal-box"
        style={{ background: T.white, borderRadius: 24, maxWidth: 860, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,.22)" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: T.navy8, border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", display: "grid", placeItems: "center", zIndex: 10 }}>
          <X size={16} color={T.navy3} />
        </button>

        {/* header */}
        <div style={{ padding: "26px 30px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 11, color: T.navy4, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
            Evaluation Report — {c.name}
          </div>
          <div style={{ fontSize: 13, color: T.navy4 }}>
            {c.scheduled} · {c.role} · {c.department} · {c.id}
          </div>
        </div>

        {/* score + meta */}
        <div style={{ padding: "22px 30px", borderBottom: `1px solid ${T.navy7}`, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: T.navy4, marginBottom: 2 }}>OVERALL SCORE</div>
              <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: c.score != null ? scoreColor : T.navy5 }}>
                {c.score ?? "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy0, marginBottom: 3 }}>{c.name}</div>
              {c.email && <div style={{ fontSize: 12, color: T.navy4, marginBottom: 4 }}>{c.email}</div>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {c.rec && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, ...REC_CONFIG[c.rec] }}>{c.rec}</span>}
                <span style={{ fontSize: 11, color: T.navy4 }}>{c.role}</span>
                {c.experience != null && <span style={{ fontSize: 11, color: T.navy4 }}>· {c.experience} yrs exp</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            <div style={{ textAlign: "center", padding: "10px 18px", background: "#EEF2FF", borderRadius: 12 }}>
              <ThumbsUp size={16} color={T.primary} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 10, color: T.navy4 }}>AI Rec.</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{c.rec || "Pending"}</div>
            </div>
            <div style={{ textAlign: "center", padding: "10px 18px", background: T.navy8, borderRadius: 12 }}>
              <AlertCircle size={16} color={T.navy4} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 10, color: T.navy4 }}>Status</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy2 }}>{c.status}</div>
            </div>
          </div>
        </div>

        {/* strengths */}
        <div style={{ padding: "20px 30px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.navy0 }}>STRENGTHS</div>
          <ul style={{ marginLeft: 18, color: T.navy3, fontSize: 13, lineHeight: 1.9 }}>
            {(Array.isArray(c.strengths) && c.strengths.length ? c.strengths : [
              "Strong technical fundamentals and problem-solving ability",
              "Clear, well-structured communication throughout the interview",
              "Proactively considered edge cases and trade-offs",
            ]).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        {/* areas to probe */}
        <div style={{ padding: "20px 30px", borderBottom: `1px solid ${T.navy7}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.navy0 }}>AREAS TO PROBE IN FINAL ROUND</div>
          <ul style={{ marginLeft: 18, color: T.navy3, fontSize: 13, lineHeight: 1.9 }}>
            {(Array.isArray(c.areasToProbe) && c.areasToProbe.length ? c.areasToProbe : [
              "Could go deeper on system-design scalability trade-offs",
            ]).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        {/* AI summary + actions */}
        <div style={{ padding: "20px 30px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.navy0 }}>AI RECOMMENDATION SUMMARY</div>
          <div style={{ background: "#EEF2FF", padding: 16, borderRadius: 12, fontSize: 13, color: T.navy2, lineHeight: 1.7, marginBottom: 20 }}>
            {c.summaryText || (
              c.rec === "Proceed"
                ? "Proceed — Candidate demonstrates strong technical fundamentals and clear problem-solving. Recommended focus areas for final round: system design trade-offs and leadership scenarios."
                : c.rec === "On Hold"
                ? "Hold — Candidate shows potential but needs improvement in key technical areas. Consider for a different role or re-evaluation after upskilling."
                : "Reject — Candidate does not meet the required technical bar for this position at this time."
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={handleExport} style={{ padding: "9px 18px", background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: T.navy2, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
              <Download size={13} /> Export
            </button>
            <button onClick={onClose} style={{ padding: "9px 22px", background: T.primary, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: FONT }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STAT PILL ──────────────────────────────────────────────────── */
function StatPill({ label, count, color, bg }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14, padding: "14px 20px", display: "flex", flexDirection: "column", gap: 4, flex: "1 1 90px", minWidth: 90, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || T.navy0 }}>{count}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.navy4 }}>{label}</div>
      <div style={{ height: 3, borderRadius: 99, background: bg || T.navy7, marginTop: 2 }} />
    </div>
  );
}

/* ─── TABLE SKELETON ─────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${T.navy7}` }}>
          {[180, 120, 100, 90, 80, 90, 110, 80, 180].map((w, j) => (
            <td key={j} style={{ padding: "16px 18px" }}>
              <div className="skeleton" style={{ width: w, height: 14 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function CandidatesPage() {
  const [collapsed, setCollapsed] = useState(false);
  const SW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeStatus, setActiveStatus] = useState("All");
  const [activeRole, setActiveRole]     = useState("All Roles");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const PER_PAGE = 12;

  const [reportModal, setReportModal] = useState(null);
  const [decisions, setDecisions]     = useState({});
  const [hRow, setHRow]               = useState(null);

  /* ── FETCH ── */
  async function fetchCandidates() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [candidates, assessments, interviews, decisions, outputs, feedback] = await Promise.all([
        api.candidates().catch(() => []),
        api.assessments().catch(() => []),
        api.interviews().catch(() => []),
        api.finalDecisions().catch(() => []),
        api.agentOutputs().catch(() => []),
        api.hrFeedback().catch(() => []),
      ]);
      
      // Merge all data
      const rows = mergeCandidateData(
        candidates || [], 
        assessments || [], 
        interviews || [], 
        decisions || [], 
        outputs || [], 
        feedback || []
      );
      
      setAllCandidates(rows);
    } catch (e) {
      console.error("Fetch error:", e);
      setError(e.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchCandidates(); 
  }, []);

  /* role options derived from real data */
  const roleOptions = useMemo(() => {
    const roles = [...new Set(allCandidates.map(c => c.role).filter(r => r && r !== "—"))].sort();
    return ["All Roles", ...roles];
  }, [allCandidates]);

  /* filtered list */
  const filtered = useMemo(() => {
    return allCandidates.filter(c => {
      const matchStatus = activeStatus === "All" || c.status === activeStatus;
      const matchRole   = activeRole === "All Roles" || c.role === activeRole;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [c.name, c.role, c.department, c.id, c.sessionId]
        .some(v => (v || "").toLowerCase().includes(q));
      return matchStatus && matchRole && matchSearch;
    });
  }, [allCandidates, activeStatus, activeRole, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = useMemo(() => {
    const c = { Scheduled: 0, "In Progress": 0, Completed: 0, Escalated: 0, Rejected: 0 };
    allCandidates.forEach(r => { if (c[r.status] !== undefined) c[r.status]++; });
    return c;
  }, [allCandidates]);

  async function handleDecision(id, decision) {
    // Map UI decision to backend decision value
    const decisionMap = { Accept: "Selected", Hold: "Hold", Reject: "Rejected" };
    const backendDecision = decisionMap[decision];
    
    try {
      // Optimistic update
      setDecisions(prev => ({ ...prev, [id]: decision }));
      
      // Call API
      await api.updateDecision(id, backendDecision);
      
      // Refresh data to ensure consistency
      await fetchCandidates();
    } catch (e) {
      console.error("Decision update error:", e);
      // Revert optimistic update on error
      setDecisions(prev => {
        const newDecisions = { ...prev };
        delete newDecisions[id];
        return newDecisions;
      });
      setError(e.message || "Failed to update decision");
    }
  }

  function handleFilter(type, value) {
    if (type === "status") setActiveStatus(value);
    if (type === "role")   setActiveRole(value);
    setPage(1);
  }

  function exportCSV() {
    const cols = ["id", "name", "role", "department", "experience", "score", "rec", "status", "sessionId", "scheduled"];
    const header = cols.join(",");
    const rows = filtered.map(r => cols.map(k => `"${r[k] ?? ""}"`).join(","));
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); 
    a.href = URL.createObjectURL(blob); 
    a.download = `candidates_export_${new Date().toISOString().slice(0,10)}.csv`; 
    a.click();
  }

  return (
    <>
      <GlobalStyles />

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: FONT, background: T.bg }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} activeKey="candidates" />

        <div style={{ marginLeft: SW, flex: 1, height: "100vh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", transition: "margin-left .25s cubic-bezier(.4,0,.2,1)" }}>

          {/* ── TOPBAR ── */}
          <header style={{ position: "sticky", top: 0, zIndex: 100, background: T.white, borderBottom: `1px solid ${T.navy7}`, padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <button onClick={() => setCollapsed(v => !v)} style={{ background: T.navy8, border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Menu size={16} color={T.navy3} />
              </button>
              <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name, role, ID…"
                  style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, border: `1px solid ${T.navy7}`, borderRadius: 10, fontSize: 13, fontFamily: FONT, color: T.navy2, background: T.navy8, outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              <button onClick={fetchCandidates} title="Refresh" style={{ background: "none", border: "none", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <RefreshCw size={17} color={T.navy4} />
              </button>
              <button onClick={exportCSV} title="Export CSV" style={{ background: "none", border: "none", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <Download size={17} color={T.navy4} />
              </button>
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Bell size={19} color={T.navy3} />
                <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#DC2626", border: "2px solid #fff" }} />
              </div>
              <div style={{ width: 1, height: 26, background: T.navy7 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#5929D0,#CF008B)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>A</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy0, lineHeight: 1.2 }}>Alex Morgan</div>
                  <div style={{ fontSize: 11, color: T.navy4 }}>Senior Recruiter</div>
                </div>
              </div>
            </div>
          </header>

          {/* ── MAIN ── */}
          <main className="page-main" style={{ padding: "26px 28px 40px", flex: 1 }}>

            {/* page title row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 26, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},#CF008B)` }} />
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: T.navy0 }}>Candidates</h1>
                </div>
                <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
                  ATS Interview Status Panel · {allCandidates.length} total candidates
                </p>
              </div>
              <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 7, background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: T.navy2, cursor: "pointer", fontFamily: FONT }}>
                <Download size={14} /> Export CSV
              </button>
            </div>

            {/* stat pills */}
            <div className="stat-pills" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
              <StatPill label="Scheduled"   count={counts.Scheduled}       color="#5929D0" bg="#E8E5FF" />
              <StatPill label="In Progress" count={counts["In Progress"]}  color="#D97706" bg="#FEF3C7" />
              <StatPill label="Completed"   count={counts.Completed}       color="#16A34A" bg="#DCFCE7" />
              <StatPill label="Escalated"   count={counts.Escalated}       color="#0891B2" bg="#CFFAFE" />
              <StatPill label="Rejected"    count={counts.Rejected}        color="#DC2626" bg="#FEE2E2" />
              <StatPill label="Total"       count={allCandidates.length}   color={T.navy0} bg={T.navy7} />
            </div>

            {/* filters */}
            <div style={{ background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Filter size={13} color={T.navy4} />
                <span style={{ fontSize: 12, fontWeight: 600, color: T.navy4 }}>Status:</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STATUSES.map(s => (
                  <button key={s} className={`filter-pill ${activeStatus === s ? "active" : "inactive"}`} onClick={() => handleFilter("status", s)}>{s}</button>
                ))}
              </div>

              <div style={{ width: 1, height: 22, background: T.navy7, flexShrink: 0 }} />

              <div style={{ position: "relative" }}>
                <select value={activeRole} onChange={e => handleFilter("role", e.target.value)}
                  style={{ appearance: "none", background: T.navy8, border: `1px solid ${T.navy7}`, borderRadius: 8, padding: "7px 30px 7px 12px", fontSize: 12.5, fontWeight: 600, color: T.navy2, fontFamily: FONT, cursor: "pointer", outline: "none" }}>
                  {roleOptions.map(r => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown size={13} color={T.navy4} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>

              <div style={{ marginLeft: "auto", fontSize: 12, color: T.navy5, fontWeight: 500, display: "flex", alignItems: "center", gap: 10 }}>
                {filtered.length} of {allCandidates.length}
                {(search || activeStatus !== "All" || activeRole !== "All Roles") && (
                  <button onClick={() => { setSearch(""); setActiveStatus("All"); setActiveRole("All Roles"); setPage(1); }}
                    style={{ background: "#FEF2F2", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#DC2626", cursor: "pointer", fontFamily: FONT }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* error */}
            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", color: "#DC2626", fontWeight: 600, marginBottom: 16 }}>
                ⚠️ {error} &nbsp;
                <button onClick={fetchCandidates} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontWeight: 700, textDecoration: "underline", fontFamily: FONT }}>Retry</button>
              </div>
            )}

            {/* table */}
            <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
                  <thead>
                    <tr style={{ background: T.navy8, borderBottom: `1px solid ${T.navy7}` }}>
                      {["Candidate", "Role", "Session ID", "Scheduled", "Score", "Recommendation", "Status", "Report", "Decision"].map(h => (
                        <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <TableSkeleton /> : pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "60px 20px", color: T.navy4 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <User size={38} color={T.navy6} />
                            <div style={{ fontWeight: 600 }}>No candidates found</div>
                            <div style={{ fontSize: 13 }}>Try adjusting your filters or search term</div>
                          </div>
                        </td>
                      </tr>
                    ) : pageRows.map((c, i) => {
                      const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG["Scheduled"];
                      const StatusIcon = sc.icon;
                      const decision = decisions[c.id];

                      return (
                        <tr key={c.id} className="cand-tr"
                          style={{ borderBottom: `1px solid ${T.navy7}`, background: hRow === i ? T.bg : T.white }}
                          onMouseEnter={() => setHRow(i)} onMouseLeave={() => setHRow(null)}
                        >
                          {/* candidate */}
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{c.ini}</div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy0 }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: T.navy5 }}>{c.id}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "13px 18px", fontSize: 13, color: T.navy3 }}>{c.role}</td>
                          <td style={{ padding: "13px 18px", fontSize: 12, fontFamily: "monospace", color: T.navy4 }}>{c.sessionId}</td>
                          <td style={{ padding: "13px 18px", fontSize: 12.5, color: T.navy3, whiteSpace: "nowrap" }}>{c.scheduled}</td>

                          {/* score */}
                          <td style={{ padding: "13px 18px" }}>
                            {c.score != null ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 46, height: 6, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${c.score}%`, borderRadius: 999, background: c.score >= 85 ? "#16A34A" : c.score >= 70 ? "#D97706" : "#DC2626" }} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: T.navy0 }}>{c.score}</span>
                              </div>
                            ) : <span style={{ fontSize: 12, color: T.navy5 }}>—</span>}
                          </td>

                          {/* recommendation */}
                          <td style={{ padding: "13px 18px" }}>
                            {c.rec
                              ? <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, ...REC_CONFIG[c.rec] }}>{c.rec}</span>
                              : <span style={{ fontSize: 12, color: T.navy5 }}>Pending</span>}
                          </td>

                          {/* status */}
                          <td style={{ padding: "13px 18px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, background: sc.bg, color: sc.color }}>
                              <StatusIcon size={12} />{c.status}
                            </span>
                          </td>

                          {/* report */}
                          <td style={{ padding: "13px 18px" }}>
                            <button className="action-btn" style={{ background: "#EEF2FF", color: T.primary }} onClick={() => setReportModal(c)}>
                              <FileText size={13} /> Report
                            </button>
                          </td>

                          {/* decision */}
                          <td style={{ padding: "13px 18px" }}>
                            {decision ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: decision === "Accept" ? "#DCFCE7" : decision === "Hold" ? "#FEF3C7" : "#FEE2E2", color: decision === "Accept" ? "#16A34A" : decision === "Hold" ? "#D97706" : "#DC2626" }}>
                                {decision === "Accept" ? <ThumbsUp size={12} /> : decision === "Hold" ? <MinusCircle size={12} /> : <ThumbsDown size={12} />}
                                {decision}
                              </span>
                            ) : (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="action-btn" style={{ background: "#DCFCE7", color: "#16A34A" }} onClick={() => handleDecision(c.id, "Accept")}><ThumbsUp size={12} /> Accept</button>
                                <button className="action-btn" style={{ background: "#FEF3C7", color: "#D97706" }} onClick={() => handleDecision(c.id, "Hold")}><MinusCircle size={12} /> Hold</button>
                                <button className="action-btn" style={{ background: "#FEE2E2", color: "#DC2626" }} onClick={() => handleDecision(c.id, "Reject")}><ThumbsDown size={12} /> Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              {!loading && filtered.length > PER_PAGE && (
                <div style={{ padding: "13px 20px", borderTop: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: T.navy5 }}>
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                      style={{ border: `1px solid ${T.navy7}`, background: T.white, padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? .4 : 1, fontFamily: FONT }}>
                      ← Prev
                    </button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                      <button key={i + 1} onClick={() => setPage(i + 1)}
                        style={{ width: 30, height: 30, borderRadius: 7, border: (i + 1) === page ? "none" : `1px solid ${T.navy7}`, background: (i + 1) === page ? T.primary : T.white, color: (i + 1) === page ? "#fff" : T.navy3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                        {i + 1}
                      </button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                      style={{ border: `1px solid ${T.navy7}`, background: T.white, padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? .4 : 1, fontFamily: FONT }}>
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {reportModal && <ReportModal candidate={reportModal} onClose={() => setReportModal(null)} />}
    </>
  );
}