import { useState, useEffect, useMemo, Fragment } from "react";
import {
  Bell, Search, Menu, Download, FileText, Eye, Archive,
  RotateCcw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Filter, CheckCircle2, XCircle, Clock, Shield, TrendingUp,
  Award, Users, Calendar, Star, X, MoreVertical, Sparkles,
} from "lucide-react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";

/* ═══════════════════════════════════════════
   GLOBAL STYLES (scoped via data attribute)
═══════════════════════════════════════════ */
function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-centific", "final-evaluated");
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { height: 100%; }
      body {
        height: 100%;
        font-family: ${FONT};
        background: ${T.bg};
        color: ${T.navy0};
        overflow: hidden;
      }
      #root { height: 100%; display: flex; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: ${T.navy8}; }
      ::-webkit-scrollbar-thumb { background: ${T.navy6}; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: ${T.navy5}; }

      .fe-card-lift { transition: transform .18s ease, box-shadow .18s ease; }
      .fe-card-lift:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(89,41,208,.14) !important; }

      .fe-btn {
        display: inline-flex; align-items: center; gap: 6px;
        border: 1px solid ${T.navy7}; background: ${T.white}; color: ${T.navy2};
        border-radius: 8px; padding: 7px 13px; font-size: 12px; font-weight: 600;
        font-family: ${FONT}; cursor: pointer;
        transition: all .15s ease;
      }
      .fe-btn:hover { border-color: ${T.primaryBorder}; color: ${T.primary}; background: ${T.primaryLight}; }
      .fe-btn-primary {
        background: ${T.primary}; color: #fff; border-color: ${T.primary};
      }
      .fe-btn-primary:hover { background: #4318b0; border-color: #4318b0; color: #fff; }
      .fe-btn-ghost { background: transparent; border-color: transparent; }
      .fe-btn-ghost:hover { background: ${T.navy8}; border-color: ${T.navy7}; }

      .fe-input {
        width: 100%; padding: 9px 12px;
        border: 1px solid ${T.navy7}; border-radius: 9px;
        font-size: 13px; font-family: ${FONT}; color: ${T.navy1};
        background: ${T.white}; outline: none;
        transition: border-color .15s, box-shadow .15s;
      }
      .fe-input:focus { border-color: ${T.primary}; box-shadow: 0 0 0 3px rgba(89,41,208,.08); }

      .fe-row-hover:hover { background: ${T.navy8} !important; }

      @keyframes fe-fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fe-fade-up { animation: fe-fadeUp .45s ease forwards; }

      @keyframes fe-shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .fe-skel {
        background: linear-gradient(90deg, ${T.navy8} 25%, ${T.navy7} 50%, ${T.navy8} 75%);
        background-size: 800px 100%;
        animation: fe-shimmer 1.4s linear infinite;
        border-radius: 6px;
      }

      @keyframes fe-toastIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .fe-toast { animation: fe-toastIn .3s ease forwards; }

      @keyframes fe-spin { to { transform: rotate(360deg); } }
      .fe-spinner { animation: fe-spin .9s linear infinite; }

      .fe-checkbox {
        width: 16px; height: 16px;
        border: 1.5px solid ${T.navy6}; border-radius: 4px;
        cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
        background: ${T.white}; transition: all .15s;
      }
      .fe-checkbox.checked { background: ${T.primary}; border-color: ${T.primary}; }
      .fe-checkbox:hover { border-color: ${T.primary}; }
    `;
    document.head.appendChild(el);
    return () => { if (document.head.contains(el)) document.head.removeChild(el); };
  }, []);
  return null;
}

/* ═══════════════════════════════════════════
   ANIMATED COUNTER HOOK
═══════════════════════════════════════════ */
function useCounter(target, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start = null;
    const isFloat = !Number.isInteger(target);
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(isFloat ? +(eased * target).toFixed(1) : Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ═══════════════════════════════════════════
   DUMMY CANDIDATE DATA
   - All have humanFinalDecision === true
   - decisionStatus is the FINAL status
═══════════════════════════════════════════ */
const RAW_CANDIDATES = [
  {
    id: "CND-1042", name: "Priya Sharma", role: "ML Engineer", department: "AI",
    experience: 6, aiScore: 92, interviewScore: 89, finalScore: 91,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-18",
    confidence: 96, humanFinalDecision: true, ini: "PS", color: "#5929D0",
    skillMatch: 94, communication: 9.1, technical: 9.4, cultureFit: 8.8,
    interviewerNotes: "Strong systems thinking, excellent ML fundamentals, presented portfolio with clarity.",
    recruiterNotes: "Top-tier candidate. Aligned on compensation. Ready for offer.",
    aiSummary: "High alignment with role requirements. No bias indicators detected across panels.",
    decisionReason: "Outperformed peers on technical depth and culture interview.",
  },
  {
    id: "CND-1043", name: "Marcus Lee", role: "Product Manager", department: "Product",
    experience: 8, aiScore: 81, interviewScore: 76, finalScore: 78,
    biasSafe: true, decision: "Hold", decisionDate: "2025-04-17",
    confidence: 72, humanFinalDecision: true, ini: "ML", color: "#CF008B",
    skillMatch: 79, communication: 8.3, technical: 7.4, cultureFit: 8.0,
    interviewerNotes: "Solid PM craft, gaps on technical depth for AI-product domain.",
    recruiterNotes: "Hold for Q3 review when AI-PM role opens.",
    aiSummary: "Moderate fit. Recommend re-evaluation against future roles.",
    decisionReason: "Strong generalist but role mismatch on AI specialization.",
  },
  {
    id: "CND-1044", name: "Anjali Reddy", role: "UX Designer", department: "Design",
    experience: 5, aiScore: 88, interviewScore: 90, finalScore: 89,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-16",
    confidence: 92, humanFinalDecision: true, ini: "AR", color: "#22D3EE",
    skillMatch: 91, communication: 9.3, technical: 8.5, cultureFit: 9.4,
    interviewerNotes: "Outstanding portfolio, end-to-end product thinking, strong stakeholder skills.",
    recruiterNotes: "Hire. Offer extended.",
    aiSummary: "Excellent fit. Diverse panel scored consistently high.",
    decisionReason: "Best-in-class design thinking and team chemistry.",
  },
  {
    id: "CND-1045", name: "David Okafor", role: "Sales Lead", department: "Sales",
    experience: 9, aiScore: 64, interviewScore: 58, finalScore: 62,
    biasSafe: true, decision: "Rejected", decisionDate: "2025-04-15",
    confidence: 88, humanFinalDecision: true, ini: "DO", color: "#F59E0B",
    skillMatch: 60, communication: 7.0, technical: 5.8, cultureFit: 6.4,
    interviewerNotes: "Sales chops present but enterprise-AI experience lacking.",
    recruiterNotes: "Not a fit for current senior role. Polite decline sent.",
    aiSummary: "Below threshold for enterprise AI sales track.",
    decisionReason: "Did not meet bar on technical sales for AI products.",
  },
  {
    id: "CND-1046", name: "Sofia Hernandez", role: "Frontend Engineer", department: "Engineering",
    experience: 4, aiScore: 95, interviewScore: 93, finalScore: 94,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-19",
    confidence: 97, humanFinalDecision: true, ini: "SH", color: "#10B981",
    skillMatch: 96, communication: 9.0, technical: 9.6, cultureFit: 9.1,
    interviewerNotes: "Exceptional technical interview. Clean architecture instincts.",
    recruiterNotes: "Strong hire. Extended offer with sign-on bonus.",
    aiSummary: "Top decile candidate. All panels aligned.",
    decisionReason: "Highest technical score in cohort.",
  },
  {
    id: "CND-1047", name: "James Whitfield", role: "Data Analyst", department: "Data",
    experience: 3, aiScore: 71, interviewScore: 68, finalScore: 70,
    biasSafe: true, decision: "Hold", decisionDate: "2025-04-14",
    confidence: 65, humanFinalDecision: true, ini: "JW", color: "#6366F1",
    skillMatch: 68, communication: 7.5, technical: 7.2, cultureFit: 7.6,
    interviewerNotes: "Good SQL fundamentals, weaker on statistical reasoning.",
    recruiterNotes: "Considering for junior role with mentorship plan.",
    aiSummary: "Borderline fit. Promising trajectory.",
    decisionReason: "Awaiting hiring manager final review for adjusted role.",
  },
  {
    id: "CND-1048", name: "Aisha Khan", role: "DevOps Engineer", department: "Engineering",
    experience: 7, aiScore: 87, interviewScore: 85, finalScore: 86,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-13",
    confidence: 90, humanFinalDecision: true, ini: "AK", color: "#EC4899",
    skillMatch: 88, communication: 8.7, technical: 9.0, cultureFit: 8.5,
    interviewerNotes: "Strong K8s and observability experience. Clear communicator.",
    recruiterNotes: "Hire confirmed. Offer signed.",
    aiSummary: "Strong fit across all dimensions.",
    decisionReason: "Senior infra experience aligned with platform roadmap.",
  },
  {
    id: "CND-1049", name: "Ravi Iyer", role: "AI Researcher", department: "AI",
    experience: 5, aiScore: 90, interviewScore: 88, finalScore: 89,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-12",
    confidence: 93, humanFinalDecision: true, ini: "RI", color: "#8B5CF6",
    skillMatch: 92, communication: 8.4, technical: 9.5, cultureFit: 8.6,
    interviewerNotes: "Two NeurIPS publications, strong applied research bent.",
    recruiterNotes: "Hire. Joining within 4 weeks.",
    aiSummary: "Excellent research-engineering balance.",
    decisionReason: "Aligned with foundation models team needs.",
  },
  {
    id: "CND-1050", name: "Linh Tran", role: "Backend Engineer", department: "Engineering",
    experience: 6, aiScore: 84, interviewScore: 82, finalScore: 83,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-11",
    confidence: 87, humanFinalDecision: true, ini: "LT", color: "#14B8A6",
    skillMatch: 85, communication: 8.2, technical: 8.8, cultureFit: 8.3,
    interviewerNotes: "Distributed systems strength. Calm under pressure.",
    recruiterNotes: "Hire confirmed.",
    aiSummary: "Reliable senior contributor profile.",
    decisionReason: "Consistent strong signal across rounds.",
  },
  {
    id: "CND-1051", name: "Olu Adeyemi", role: "HR Business Partner", department: "HR",
    experience: 10, aiScore: 79, interviewScore: 86, finalScore: 83,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-10",
    confidence: 89, humanFinalDecision: true, ini: "OA", color: "#F97316",
    skillMatch: 84, communication: 9.4, technical: 7.0, cultureFit: 9.5,
    interviewerNotes: "Exceptional EQ and people leadership experience.",
    recruiterNotes: "Hire. Will lead HRBP for AI org.",
    aiSummary: "Strong people-leader signal.",
    decisionReason: "Best fit for HRBP partnering with AI leadership.",
  },
  {
    id: "CND-1052", name: "Maria Gonzalez", role: "Operations Lead", department: "Ops",
    experience: 8, aiScore: 76, interviewScore: 72, finalScore: 74,
    biasSafe: true, decision: "Hold", decisionDate: "2025-04-09",
    confidence: 70, humanFinalDecision: true, ini: "MG", color: "#0EA5E9",
    skillMatch: 73, communication: 8.0, technical: 7.4, cultureFit: 8.1,
    interviewerNotes: "Good ops background, less exposure to scaling AI workflows.",
    recruiterNotes: "Hold for AI-Ops specialist role opening Q3.",
    aiSummary: "Re-evaluate against scoped role.",
    decisionReason: "Capable, but better aligned to a later opening.",
  },
  {
    id: "CND-1053", name: "Tomasz Kowalski", role: "Security Engineer", department: "Engineering",
    experience: 9, aiScore: 67, interviewScore: 64, finalScore: 65,
    biasSafe: true, decision: "Rejected", decisionDate: "2025-04-08",
    confidence: 84, humanFinalDecision: true, ini: "TK", color: "#64748B",
    skillMatch: 64, communication: 6.8, technical: 7.0, cultureFit: 6.2,
    interviewerNotes: "Compliance-heavy background, gaps on offensive security.",
    recruiterNotes: "Not a fit for offensive-security mandate.",
    aiSummary: "Below bar for current scope.",
    decisionReason: "Role required red-team depth.",
  },
  {
    id: "CND-1054", name: "Hannah Becker", role: "Data Scientist", department: "Data",
    experience: 4, aiScore: 89, interviewScore: 91, finalScore: 90,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-07",
    confidence: 94, humanFinalDecision: true, ini: "HB", color: "#A855F7",
    skillMatch: 91, communication: 8.9, technical: 9.2, cultureFit: 9.0,
    interviewerNotes: "Excellent stats foundation, clear storytelling with data.",
    recruiterNotes: "Hire. Joining experimentation team.",
    aiSummary: "Strong fit. High signal across panels.",
    decisionReason: "Best statistical depth in cohort.",
  },
  {
    id: "CND-1055", name: "Ethan Mwangi", role: "ML Engineer", department: "AI",
    experience: 5, aiScore: 82, interviewScore: 80, finalScore: 81,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-06",
    confidence: 85, humanFinalDecision: true, ini: "EM", color: "#DC2626",
    skillMatch: 83, communication: 8.1, technical: 8.6, cultureFit: 8.2,
    interviewerNotes: "Solid ML platform experience. Pragmatic.",
    recruiterNotes: "Hire. Sound platform-engineering signal.",
    aiSummary: "Reliable senior ML profile.",
    decisionReason: "Platform experience matches roadmap.",
  },
  {
    id: "CND-1056", name: "Sara Nakamura", role: "Recruitment Specialist", department: "HR",
    experience: 6, aiScore: 73, interviewScore: 70, finalScore: 71,
    biasSafe: true, decision: "Rejected", decisionDate: "2025-04-05",
    confidence: 76, humanFinalDecision: true, ini: "SN", color: "#65A30D",
    skillMatch: 70, communication: 7.6, technical: 6.4, cultureFit: 7.2,
    interviewerNotes: "Generalist recruiting profile. Less AI-domain context.",
    recruiterNotes: "Decline with future-fit note.",
    aiSummary: "Below threshold for AI-recruitment scope.",
    decisionReason: "Role required AI-domain recruiting depth.",
  },
  {
    id: "CND-1057", name: "Yara Haddad", role: "Solutions Architect", department: "Engineering",
    experience: 11, aiScore: 91, interviewScore: 89, finalScore: 90,
    biasSafe: true, decision: "Selected", decisionDate: "2025-04-04",
    confidence: 95, humanFinalDecision: true, ini: "YH", color: "#7C3AED",
    skillMatch: 93, communication: 9.0, technical: 9.3, cultureFit: 8.9,
    interviewerNotes: "Senior architect, multi-cloud, excellent customer-facing skills.",
    recruiterNotes: "Hire. Strong leadership add.",
    aiSummary: "Excellent senior IC signal.",
    decisionReason: "Top architecture and leadership composite.",
  },
];

/* ═══════════════════════════════════════════
   COLOR HELPERS
═══════════════════════════════════════════ */
const DECISION_PILL = {
  Selected: { bg: "#DCFCE7", color: "#16A34A", dot: "#16A34A" },
  Rejected: { bg: "#FEE2E2", color: "#DC2626", dot: "#DC2626" },
  Hold:     { bg: "#FEF3C7", color: "#D97706", dot: "#D97706" },
};
const DEPT_COLOR = {
  AI: T.primary, Engineering: T.cyan, Data: "#10B981",
  Ops: "#F59E0B", HR: T.pink, Product: "#8B5CF6", Sales: "#F97316", Design: "#EC4899",
};

/* ═══════════════════════════════════════════
   KPI STAT CARD
═══════════════════════════════════════════ */
function StatCard({ title, value, suffix, icon: Icon, accent, accentLight, delay = 0, isFloat = false }) {
  const num = useCounter(value);
  const display = isFloat ? num.toFixed(1) : num.toLocaleString();
  return (
    <div className="fe-card-lift fe-fade-up" style={{
      animationDelay: `${delay}ms`,
      background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`,
      padding: "20px 22px", flex: "1 1 180px", minWidth: 175,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: 3,
        background: `linear-gradient(90deg,${accent},${accent}88)`,
        borderRadius: "16px 16px 0 0",
      }} />
      <div style={{
        position: "absolute", top: 16, right: 16, width: 36, height: 36,
        borderRadius: 10, background: accentLight,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={accent} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.navy4, marginBottom: 8, letterSpacing: ".03em", textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.navy0, lineHeight: 1, display: "flex", alignItems: "baseline", gap: 4 }}>
        {display}{suffix && <span style={{ fontSize: 14, fontWeight: 700, color: T.navy4 }}>{suffix}</span>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BAR CHART — Decisions by Department
═══════════════════════════════════════════ */
function BarChart({ data }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 350); return () => clearTimeout(t); }, []);
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{
      background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`,
      padding: "22px 24px", flex: "1 1 320px", minWidth: 300,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy0, marginBottom: 3 }}>Final Decisions by Department</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 18 }}>Total approved decisions per department</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 170, paddingTop: 8 }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 140;
          return (
            <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.navy1 }}>{d.value}</div>
              <div style={{
                width: "100%", maxWidth: 42, height: ready ? h : 0,
                background: `linear-gradient(180deg, ${d.color}, ${d.color}dd)`,
                borderRadius: "8px 8px 4px 4px",
                transition: `height .9s cubic-bezier(.4,0,.2,1) ${i * 90}ms`,
                boxShadow: `0 4px 14px ${d.color}40`,
              }} />
              <div style={{ fontSize: 11, color: T.navy4, fontWeight: 500 }}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PIE CHART — Selected vs Rejected vs Hold
═══════════════════════════════════════════ */
function PieChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const R = 62, cx = 80, cy = 80, SW = 24;
  const circ = 2 * Math.PI * R;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cum = 0;
  const slices = data.map((d) => {
    const pct = (d.value / total) * 100;
    const offset = circ * (1 - cum / 100);
    const dash = (pct / 100) * circ;
    const gap = circ - dash;
    cum += pct;
    return { ...d, pct, offset, dash, gap };
  });

  return (
    <div style={{
      background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`,
      padding: "22px 24px", flex: "1 1 260px", minWidth: 240,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy0, marginBottom: 3 }}>Decision Mix</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 14 }}>Selected vs Rejected vs Hold</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color}
              strokeWidth={hovered === i ? SW + 5 : SW}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              style={{ transformOrigin: `${cx}px ${cy}px`, transform: "rotate(-90deg)", transition: "stroke-width .2s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
          ))}
          {hovered !== null ? (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="800" fill={slices[hovered].color}>{slices[hovered].pct.toFixed(0)}%</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={T.navy4}>{slices[hovered].label}</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill={T.navy0}>Total</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill={T.navy5}>{total}</text>
            </>
          )}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, transform: hovered === i ? "scale(1.35)" : "scale(1)", transition: "transform .15s" }} />
              <span style={{ fontSize: 12, fontWeight: hovered === i ? 700 : 500, color: hovered === i ? T.navy0 : T.navy3 }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color, marginLeft: "auto" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LINE CHART — Weekly Closure Trend
═══════════════════════════════════════════ */
function LineChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 420); return () => clearTimeout(t); }, []);

  const VW = 380, VH = 165, pL = 30, pB = 24, pT = 12, pR = 12;
  const MAX = Math.max(...data.map(d => d.value), 1) * 1.2;
  const pts = data.map((d, i) => ({
    x: pL + i * ((VW - pL - pR) / (data.length - 1)),
    y: pT + (VH - pB - pT) - (d.value / MAX) * (VH - pB - pT),
    v: d.value, label: d.label,
  }));
  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }, "");
  const fillPath = `${linePath} L ${pts[pts.length-1].x} ${VH - pB} L ${pts[0].x} ${VH - pB} Z`;

  return (
    <div style={{
      background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`,
      padding: "22px 24px", flex: "1 1 320px", minWidth: 300,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy0, marginBottom: 3 }}>Weekly Closure Trend</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 14 }}>Final decisions completed per week</div>
      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="feLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.primary} stopOpacity=".2" />
            <stop offset="100%" stopColor={T.primary} stopOpacity="0" />
          </linearGradient>
          <clipPath id="feLineReveal">
            <rect x={pL} y={0} height={VH}
              style={{ width: ready ? VW - pL - pR + 2 : 0, transition: "width 1.2s cubic-bezier(.4,0,.2,1) .2s" }} />
          </clipPath>
        </defs>
        {[0, 0.33, 0.66, 1].map((f, i) => {
          const v = Math.round(MAX * f);
          const y = pT + (VH - pB - pT) - f * (VH - pB - pT);
          return (
            <g key={i}>
              <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke={T.navy7} strokeWidth="1" />
              <text x={pL - 6} y={y + 3} fontSize="9" fill={T.navy5} textAnchor="end">{v}</text>
            </g>
          );
        })}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={VH - 4} fontSize="9.5" fill={T.navy5} textAnchor="middle">{p.label}</text>
        ))}
        <path d={fillPath} fill="url(#feLineFill)" clipPath="url(#feLineReveal)" />
        <path d={linePath} fill="none" stroke={T.primary} strokeWidth="2.5" strokeLinecap="round" clipPath="url(#feLineReveal)" />
        {pts.map((p, i) => (
          <g key={i} style={{ cursor: "pointer" }}
            onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
            <circle cx={p.x} cy={p.y} r="13" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={tooltip === i ? 6 : 4.5}
              fill={T.white} stroke={T.primary} strokeWidth="2.5"
              style={{ transition: "r .15s" }} />
            {tooltip === i && (
              <g>
                <rect x={p.x - 22} y={p.y - 32} width="44" height="20" rx="6" fill={T.navy1} />
                <text x={p.x} y={p.y - 17} fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">{p.v}</text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   APPROVAL PROGRESS BARS
═══════════════════════════════════════════ */
function ApprovalProgress({ data }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 400); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`,
      padding: "22px 24px", flex: "1 1 280px", minWidth: 260,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy0, marginBottom: 3 }}>Department Approval Rate</div>
      <div style={{ fontSize: 12, color: T.navy4, marginBottom: 16 }}>% selected of total decisions</div>
      {data.map((d, i) => (
        <div key={d.label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.navy2 }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.pct}%</span>
          </div>
          <div style={{ height: 8, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: ready ? `${d.pct}%` : "0%",
              background: `linear-gradient(90deg, ${d.color}aa, ${d.color})`,
              borderRadius: 999,
              transition: `width .9s cubic-bezier(.4,0,.2,1) ${i * 80}ms`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   FILTER BAR
═══════════════════════════════════════════ */
function FilterBar({ filters, setFilters, onReset, departments, roles }) {
  const update = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const labelStyle = { fontSize: 11, fontWeight: 600, color: T.navy4, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5, display: "block" };

  return (
    <div style={{
      background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`,
      padding: "20px 22px", marginBottom: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color={T.primary} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy0 }}>Advanced Filters</span>
        </div>
        <button className="fe-btn fe-btn-ghost" onClick={onReset}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <div>
          <label style={labelStyle}>Search by Name / ID</label>
          <input className="fe-input" placeholder="e.g. Priya, CND-1042"
            value={filters.search} onChange={e => update("search", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Role</label>
          <select className="fe-input" value={filters.role} onChange={e => update("role", e.target.value)}>
            <option value="">All roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Department</label>
          <select className="fe-input" value={filters.department} onChange={e => update("department", e.target.value)}>
            <option value="">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Decision</label>
          <select className="fe-input" value={filters.decision} onChange={e => update("decision", e.target.value)}>
            <option value="">All</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Hold">Hold</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Min Final Score: <span style={{ color: T.primary, fontWeight: 700 }}>{filters.minScore}</span></label>
          <input type="range" min="0" max="100" value={filters.minScore}
            onChange={e => update("minScore", +e.target.value)} style={{ width: "100%", accentColor: T.primary }} />
        </div>
        <div>
          <label style={labelStyle}>Min Experience (yrs): <span style={{ color: T.primary, fontWeight: 700 }}>{filters.minExp}</span></label>
          <input type="range" min="0" max="15" value={filters.minExp}
            onChange={e => update("minExp", +e.target.value)} style={{ width: "100%", accentColor: T.primary }} />
        </div>
        <div>
          <label style={labelStyle}>Min Interview Score: <span style={{ color: T.primary, fontWeight: 700 }}>{filters.minInterview}</span></label>
          <input type="range" min="0" max="100" value={filters.minInterview}
            onChange={e => update("minInterview", +e.target.value)} style={{ width: "100%", accentColor: T.primary }} />
        </div>
        <div>
          <label style={labelStyle}>Date From</label>
          <input type="date" className="fe-input" value={filters.dateFrom}
            onChange={e => update("dateFrom", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Date To</label>
          <input type="date" className="fe-input" value={filters.dateTo}
            onChange={e => update("dateTo", e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.navy1 }}>
            <span
              onClick={() => update("biasSafeOnly", !filters.biasSafeOnly)}
              style={{
                width: 36, height: 20, borderRadius: 999,
                background: filters.biasSafeOnly ? T.primary : T.navy6,
                position: "relative", transition: "background .2s",
              }}>
              <span style={{
                position: "absolute", top: 2, left: filters.biasSafeOnly ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
              }} />
            </span>
            Bias-Safe Only
          </label>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONFIDENCE METER
═══════════════════════════════════════════ */
function ConfidenceMeter({ value }) {
  const color = value >= 90 ? T.primary : value >= 75 ? T.cyan : value >= 60 ? "#F59E0B" : T.error;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 80 }}>
      <div style={{ flex: 1, height: 5, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: T.navy1 }}>{value}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   EXPANDABLE ROW DETAILS
═══════════════════════════════════════════ */
function RowDetails({ c, onAction }) {
  const stat = (label, val, suffix = "") => (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: T.navy4, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.navy0 }}>{val}{suffix}</div>
    </div>
  );

  return (
    <tr>
      <td colSpan={12} style={{ padding: 0, background: T.navy8, borderBottom: `1px solid ${T.navy7}` }}>
        <div className="fe-fade-up" style={{ padding: "20px 26px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20, marginBottom: 18 }}>
            {stat("Skill Match", c.skillMatch, "%")}
            {stat("Communication", c.communication, "/10")}
            {stat("Technical", c.technical, "/10")}
            {stat("Culture Fit", c.cultureFit, "/10")}
            {stat("Confidence", c.confidence, "%")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 18 }}>
            <NoteBlock title="Interviewer Notes" body={c.interviewerNotes} icon={<FileText size={13} />} />
            <NoteBlock title="Recruiter Final Notes" body={c.recruiterNotes} icon={<Award size={13} />} />
            <NoteBlock title="AI Recommendation Summary" body={c.aiSummary} icon={<Sparkles size={13} />} />
            <NoteBlock title="Decision Reason" body={c.decisionReason} icon={<CheckCircle2 size={13} />} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button className="fe-btn fe-btn-primary" onClick={() => onAction("View Full Report", c)}>
              <Eye size={13} /> View Full Report
            </button>
            <button className="fe-btn" onClick={() => onAction("Export PDF", c)}>
              <Download size={13} /> Export PDF
            </button>
            <button className="fe-btn" onClick={() => onAction("Download Resume", c)}>
              <FileText size={13} /> Download Resume
            </button>
            <button className="fe-btn" onClick={() => onAction("Reconsider", c)}>
              <RotateCcw size={13} /> Reconsider
            </button>
            <button className="fe-btn" onClick={() => onAction("Archive", c)}>
              <Archive size={13} /> Archive
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

function NoteBlock({ title, body, icon }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.primary, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>{title}</span>
      </div>
      <div style={{ fontSize: 12.5, color: T.navy2, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fe-toast" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: T.navy0, color: "#fff",
      padding: "12px 18px", borderRadius: 10,
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 13, fontWeight: 600, fontFamily: FONT,
      boxShadow: "0 10px 30px rgba(0,0,0,.25)",
    }}>
      <CheckCircle2 size={16} color="#10B981" />
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════ */
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${T.navy7}` }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <td key={i} style={{ padding: "14px 18px" }}>
          <div className="fe-skel" style={{ height: 14, width: i === 1 ? 140 : 70 }} />
        </td>
      ))}
    </tr>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function FinalEvaluated() {
  const [collapsed, setCollapsed] = useState(false);
  const SW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [sort, setSort] = useState({ key: "decisionDate", dir: "desc" });

  const initialFilters = {
    search: "", role: "", department: "", decision: "",
    minScore: 0, minExp: 0, minInterview: 0,
    dateFrom: "", dateTo: "", biasSafeOnly: false,
  };
  const [filters, setFilters] = useState(initialFilters);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // 1) STRICT GUARDRAIL: only candidates with humanFinalDecision === true
  const finalised = useMemo(
    () => RAW_CANDIDATES.filter(c => c.humanFinalDecision === true && c.decision),
    []
  );

  const departments = useMemo(() => [...new Set(finalised.map(c => c.department))].sort(), [finalised]);
  const roles = useMemo(() => [...new Set(finalised.map(c => c.role))].sort(), [finalised]);

  // 2) Apply filters
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return finalised.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
      if (filters.role && c.role !== filters.role) return false;
      if (filters.department && c.department !== filters.department) return false;
      if (filters.decision && c.decision !== filters.decision) return false;
      if (c.finalScore < filters.minScore) return false;
      if (c.experience < filters.minExp) return false;
      if (c.interviewScore < filters.minInterview) return false;
      if (filters.biasSafeOnly && !c.biasSafe) return false;
      if (filters.dateFrom && c.decisionDate < filters.dateFrom) return false;
      if (filters.dateTo && c.decisionDate > filters.dateTo) return false;
      return true;
    });
  }, [finalised, filters]);

  // 3) Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [filtered, sort]);

  // 4) Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  // KPIs
  const stats = useMemo(() => {
    const total = finalised.length;
    const sel = finalised.filter(c => c.decision === "Selected").length;
    const rej = finalised.filter(c => c.decision === "Rejected").length;
    const avg = finalised.reduce((s, c) => s + c.finalScore, 0) / Math.max(total, 1);
    const biasSafe = finalised.filter(c => c.biasSafe).length;
    const biasRate = (biasSafe / Math.max(total, 1)) * 100;
    // "This week" = decisionDate within last 7 days from latest date in dataset
    const dates = finalised.map(c => c.decisionDate).sort();
    const latest = dates[dates.length - 1] ? new Date(dates[dates.length - 1]) : new Date();
    const weekAgo = new Date(latest); weekAgo.setDate(latest.getDate() - 6);
    const weekClosures = finalised.filter(c => {
      const d = new Date(c.decisionDate);
      return d >= weekAgo && d <= latest;
    }).length;
    return { total, sel, rej, avg: +avg.toFixed(1), biasRate: +biasRate.toFixed(1), weekClosures };
  }, [finalised]);

  // Chart data
  const barData = useMemo(() => {
    const byDept = {};
    finalised.forEach(c => { byDept[c.department] = (byDept[c.department] || 0) + 1; });
    return Object.entries(byDept)
      .map(([label, value]) => ({ label, value, color: DEPT_COLOR[label] || T.primary }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [finalised]);

  const pieData = useMemo(() => ([
    { label: "Selected", value: stats.sel, color: DECISION_PILL.Selected.color },
    { label: "Rejected", value: stats.rej, color: DECISION_PILL.Rejected.color },
    { label: "Hold", value: finalised.filter(c => c.decision === "Hold").length, color: DECISION_PILL.Hold.color },
  ]), [stats, finalised]);

  const trendData = useMemo(() => {
    // Group by ISO week from latest date backwards (6 buckets)
    const sortedDates = [...finalised].sort((a, b) => a.decisionDate.localeCompare(b.decisionDate));
    if (!sortedDates.length) return [];
    const buckets = {};
    sortedDates.forEach(c => {
      const d = new Date(c.decisionDate);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().slice(5, 10);
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets).map(([label, value]) => ({ label, value })).slice(-6);
  }, [finalised]);

  const approvalData = useMemo(() => {
    return departments.map(dept => {
      const inDept = finalised.filter(c => c.department === dept);
      const sel = inDept.filter(c => c.decision === "Selected").length;
      const pct = Math.round((sel / Math.max(inDept.length, 1)) * 100);
      return { label: dept, pct, color: DEPT_COLOR[dept] || T.primary };
    }).sort((a, b) => b.pct - a.pct);
  }, [finalised, departments]);

  /* ─── Sorting toggle ─── */
  const toggleSort = (key) => {
    setSort(s => s.key === key
      ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
      : { key, dir: "desc" });
  };

  /* ─── Bulk select ─── */
  const allOnPageSelected = pageRows.length > 0 && pageRows.every(c => selected.has(c.id));
  const togglePageSelectAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach(c => next.delete(c.id));
      else pageRows.forEach(c => next.add(c.id));
      return next;
    });
  };
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ─── Export CSV ─── */
  const exportCSV = () => {
    const cols = ["id","name","role","department","experience","aiScore","interviewScore","finalScore","biasSafe","decision","decisionDate","confidence"];
    const header = cols.join(",");
    const rows = (selected.size ? finalised.filter(c => selected.has(c.id)) : sorted)
      .map(c => cols.map(k => `"${(c[k] ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "final-evaluated-candidates.csv"; a.click();
    URL.revokeObjectURL(url);
    setToast("CSV exported successfully");
  };

  /* ─── Bulk actions ─── */
  const bulkArchive = () => {
    if (!selected.size) return setToast("Select candidates first");
    setToast(`Archived ${selected.size} candidate${selected.size > 1 ? "s" : ""}`);
    setSelected(new Set());
  };

  const handleAction = (label, c) => {
    setToast(`${label} → ${c.name}`);
  };

  const onResetFilters = () => { setFilters(initialFilters); setPage(1); };

  /* ─── Sort header cell ─── */
  const SortTh = ({ label, k, width }) => {
    const active = sort.key === k;
    return (
      <th onClick={() => toggleSort(k)}
        style={{
          padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700,
          color: active ? T.primary : T.navy4, letterSpacing: ".06em", textTransform: "uppercase",
          cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", width,
        }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {label}
          {active && (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
        </span>
      </th>
    );
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", fontFamily: FONT }}>

        {/* Sidebar */}
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

        {/* Main scrollable column */}
        <div style={{
          marginLeft: SW, flex: 1, height: "100vh",
          overflowY: "auto", overflowX: "hidden",
          display: "flex", flexDirection: "column",
          transition: "margin-left .25s cubic-bezier(.4,0,.2,1)",
          background: T.bg,
        }}>

          {/* Sticky Header */}
          <header style={{
            position: "sticky", top: 0, zIndex: 50,
            background: T.white, borderBottom: `1px solid ${T.navy7}`,
            padding: "13px 30px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 18, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <button
                onClick={() => setCollapsed(v => !v)}
                style={{
                  background: T.navy8, border: "none", borderRadius: 8,
                  padding: "7px 8px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <Menu size={16} color={T.navy3} />
              </button>
              <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
                <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  placeholder="Quick search candidates..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  style={{
                    width: "100%", paddingLeft: 36, paddingRight: 14,
                    paddingTop: 9, paddingBottom: 9,
                    border: `1px solid ${T.navy7}`, borderRadius: 10,
                    fontSize: 13, fontFamily: FONT, color: T.navy2,
                    background: T.navy8, outline: "none",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Bell size={20} color={T.navy3} />
                <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: T.error, border: "2px solid #fff" }} />
              </div>
              <div style={{ width: 1, height: 26, background: T.navy7 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#5929D0,#CF008B)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>A</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy0, lineHeight: 1.25 }}>Alex Morgan</div>
                  <div style={{ fontSize: 11, color: T.navy4 }}>Senior Recruiter</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main style={{ padding: "26px 30px 40px", flex: 1 }}>

            {/* Title */}
            <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 30, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})` }} />
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0, lineHeight: 1 }}>Final Evaluated Candidates</h1>
                </div>
                <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>
                  Human-approved final candidate decisions · <span style={{ color: T.primary, fontWeight: 600 }}>{finalised.length} records</span>
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="fe-btn" onClick={exportCSV}>
                  <Download size={13} /> Export CSV
                </button>
                <button className="fe-btn" onClick={() => setToast("PDF generation queued")}>
                  <FileText size={13} /> Export PDF
                </button>
                <button className="fe-btn fe-btn-primary" onClick={bulkArchive}>
                  <Archive size={13} /> Bulk Archive {selected.size > 0 && `(${selected.size})`}
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
              <StatCard title="Total Final Decisions" value={stats.total} icon={Users} accent={T.primary} accentLight={T.primaryLight} delay={0} />
              <StatCard title="Selected" value={stats.sel} icon={CheckCircle2} accent="#10B981" accentLight="#DCFCE7" delay={70} />
              <StatCard title="Rejected" value={stats.rej} icon={XCircle} accent={T.error} accentLight="#FEE2E2" delay={140} />
              <StatCard title="Avg Final Score" value={stats.avg} isFloat icon={Star} accent={T.pink} accentLight={T.pinkLight} delay={210} />
              <StatCard title="Bias-Free Approval" value={stats.biasRate} isFloat suffix="%" icon={Shield} accent={T.cyan} accentLight={T.cyanLight} delay={280} />
              <StatCard title="This Week Closures" value={stats.weekClosures} icon={Calendar} accent="#F59E0B" accentLight="#FEF3C7" delay={350} />
            </div>

            {/* Charts */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
              <BarChart data={barData} />
              <PieChart data={pieData} />
              <LineChart data={trendData} />
              <ApprovalProgress data={approvalData} />
            </div>

            {/* Filters */}
            <FilterBar
              filters={filters} setFilters={setFilters}
              onReset={onResetFilters}
              departments={departments} roles={roles}
            />

            {/* Table */}
            <div style={{
              background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`,
              boxShadow: "0 1px 4px rgba(0,0,0,.05)", overflow: "hidden",
            }}>
              <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: T.navy0 }}>Decision Records</div>
                  <div style={{ fontSize: 12, color: T.navy4, marginTop: 2 }}>
                    Showing {pageRows.length} of {sorted.length} {selected.size > 0 && `· ${selected.size} selected`}
                  </div>
                </div>
                {selected.size > 0 && (
                  <button className="fe-btn fe-btn-ghost" onClick={() => setSelected(new Set())}>
                    <X size={13} /> Clear selection
                  </button>
                )}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: T.navy8 }}>
                      <th style={{ padding: "11px 14px 11px 20px", width: 36 }}>
                        <span className={`fe-checkbox ${allOnPageSelected ? "checked" : ""}`} onClick={togglePageSelectAll}>
                          {allOnPageSelected && <CheckCircle2 size={11} color="#fff" />}
                        </span>
                      </th>
                      <SortTh label="ID" k="id" />
                      <SortTh label="Candidate" k="name" />
                      <SortTh label="Role" k="role" />
                      <SortTh label="Dept" k="department" />
                      <SortTh label="Exp" k="experience" />
                      <SortTh label="AI" k="aiScore" />
                      <SortTh label="Interview" k="interviewScore" />
                      <SortTh label="Final" k="finalScore" />
                      <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, letterSpacing: ".06em", textTransform: "uppercase" }}>Bias</th>
                      <SortTh label="Decision" k="decision" />
                      <SortTh label="Date" k="decisionDate" />
                      <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, letterSpacing: ".06em", textTransform: "uppercase" }}>Confidence</th>
                      <th style={{ padding: "11px 18px", textAlign: "right", fontSize: 11, fontWeight: 700, color: T.navy4, letterSpacing: ".06em", textTransform: "uppercase" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                      : pageRows.length === 0
                        ? (
                          <tr>
                            <td colSpan={14} style={{ padding: "60px 20px", textAlign: "center" }}>
                              <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy1, marginBottom: 4 }}>No candidates match these filters</div>
                              <div style={{ fontSize: 12.5, color: T.navy4, marginBottom: 14 }}>Try resetting filters or expanding your search</div>
                              <button className="fe-btn fe-btn-primary" onClick={onResetFilters}>
                                <RotateCcw size={13} /> Reset filters
                              </button>
                            </td>
                          </tr>
                        )
                        : pageRows.map((c, i) => {
                          const isExpanded = expanded === c.id;
                          const isSelected = selected.has(c.id);
                          const altBg = i % 2 === 0 ? T.white : "rgba(243,244,246,0.4)";
                          return (
                            <Fragment key={c.id}>
                              <tr className="fe-row-hover"
                                style={{
                                  borderBottom: `1px solid ${T.navy7}`,
                                  background: isSelected ? T.primaryLight : altBg,
                                  transition: "background .12s",
                                }}>
                                <td style={{ padding: "12px 14px 12px 20px" }}>
                                  <span className={`fe-checkbox ${isSelected ? "checked" : ""}`} onClick={() => toggleOne(c.id)}>
                                    {isSelected && <CheckCircle2 size={11} color="#fff" />}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 18px", fontSize: 12, color: T.navy3, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{c.id}</td>
                                <td style={{ padding: "12px 18px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{c.ini}</div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: T.navy0 }}>{c.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy3 }}>{c.role}</td>
                                <td style={{ padding: "12px 18px" }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: DEPT_COLOR[c.department] || T.primary, background: `${DEPT_COLOR[c.department] || T.primary}18`, padding: "3px 10px", borderRadius: 999 }}>{c.department}</span>
                                </td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy2, fontWeight: 600 }}>{c.experience}y</td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy2, fontWeight: 600 }}>{c.aiScore}</td>
                                <td style={{ padding: "12px 18px", fontSize: 12.5, color: T.navy2, fontWeight: 600 }}>{c.interviewScore}</td>
                                <td style={{ padding: "12px 18px" }}>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: c.finalScore >= 85 ? T.success : c.finalScore >= 70 ? T.warning : T.error }}>{c.finalScore}</span>
                                </td>
                                <td style={{ padding: "12px 18px" }}>
                                  {c.biasSafe
                                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: T.cyan, background: T.cyanLight, padding: "3px 10px", borderRadius: 999 }}><Shield size={11} /> Safe</span>
                                    : <span style={{ fontSize: 11, fontWeight: 700, color: T.error, background: "#FEE2E2", padding: "3px 10px", borderRadius: 999 }}>Flagged</span>}
                                </td>
                                <td style={{ padding: "12px 18px" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 999, background: DECISION_PILL[c.decision].bg, color: DECISION_PILL[c.decision].color }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: DECISION_PILL[c.decision].dot }} />
                                    {c.decision}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 18px", fontSize: 12, color: T.navy3 }}>{c.decisionDate}</td>
                                <td style={{ padding: "12px 18px" }}><ConfidenceMeter value={c.confidence} /></td>
                                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                                  <div style={{ display: "inline-flex", gap: 6 }}>
                                    <button className="fe-btn fe-btn-ghost" title="Resume" onClick={() => handleAction("Download Resume", c)}>
                                      <FileText size={13} />
                                    </button>
                                    <button className="fe-btn" onClick={() => setExpanded(isExpanded ? null : c.id)}>
                                      <Eye size={12} /> {isExpanded ? "Hide" : "Profile"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && <RowDetails c={c} onAction={handleAction} />}
                            </Fragment>
                          );
                        })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && sorted.length > 0 && (
                <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 12, color: T.navy4 }}>
                    Page <strong style={{ color: T.navy1 }}>{page}</strong> of <strong style={{ color: T.navy1 }}>{totalPages}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="fe-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                      style={page <= 1 ? { opacity: .4, cursor: "not-allowed" } : {}}>
                      <ChevronLeft size={13} /> Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className={n === page ? "fe-btn fe-btn-primary" : "fe-btn"}
                        style={{ minWidth: 34, justifyContent: "center" }}>
                        {n}
                      </button>
                    ))}
                    <button className="fe-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      style={page >= totalPages ? { opacity: .4, cursor: "not-allowed" } : {}}>
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer style={{
            padding: "14px 30px", borderTop: `1px solid ${T.navy7}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0, background: T.white,
          }}>
            <span style={{ fontSize: 11, color: T.navy5 }}>© 2025 Centific AI · Recruiter OS · Audit-ready hiring data</span>
            <span style={{ fontSize: 11, color: T.navy5 }}>Bias-aware · Human-final · Transparent</span>
          </footer>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}