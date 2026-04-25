import { useState } from "react";
import Sidebar, { T, FONT, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../components/Sidebar";
import {
  Search, Filter, Plus, Download, ChevronDown,
  Clock, CheckCircle2, AlertCircle, XCircle,
  ArrowUpRight, Eye, Mail, MoreHorizontal, Bell, Menu,
} from "lucide-react";

const STATUSES = ["All", "Scheduled", "In Progress", "Completed", "Escalated", "Rejected"];

const ROLES = ["All Roles", "ML Engineer", "Frontend Engineer", "Product Manager", "Data Analyst", "UX Designer", "DevOps Engineer"];

const CANDIDATES = [
  { id: "C-001", name: "Priya Sharma",    role: "ML Engineer",       score: 91, status: "Escalated",  rec: "Proceed",   scheduled: "Apr 20, 2026", completed: "Apr 20, 2026", ini: "PS", color: "#5929D0", sessionId: "SES-4421" },
  { id: "C-002", name: "Marcus Lee",      role: "Product Manager",   score: 78, status: "Completed",  rec: "On Hold",   scheduled: "Apr 21, 2026", completed: "Apr 21, 2026", ini: "ML", color: "#CF008B", sessionId: "SES-4422" },
  { id: "C-003", name: "Anjali Reddy",    role: "UX Designer",       score: 87, status: "Escalated",  rec: "Proceed",   scheduled: "Apr 19, 2026", completed: "Apr 19, 2026", ini: "AR", color: "#22D3EE", sessionId: "SES-4423" },
  { id: "C-004", name: "David Okafor",    role: "Data Analyst",      score: 62, status: "Completed",  rec: "Reject",    scheduled: "Apr 18, 2026", completed: "Apr 18, 2026", ini: "DO", color: "#F59E0B", sessionId: "SES-4424" },
  { id: "C-005", name: "Sofia Hernandez", role: "Frontend Engineer", score: 94, status: "Escalated",  rec: "Proceed",   scheduled: "Apr 22, 2026", completed: "Apr 22, 2026", ini: "SH", color: "#10B981", sessionId: "SES-4425" },
  { id: "C-006", name: "James Whitfield", role: "Data Analyst",      score: 70, status: "Completed",  rec: "On Hold",   scheduled: "Apr 22, 2026", completed: "Apr 22, 2026", ini: "JW", color: "#6366F1", sessionId: "SES-4426" },
  { id: "C-007", name: "Ayesha Khan",     role: "ML Engineer",       score: null,status: "Scheduled", rec: null,        scheduled: "Apr 26, 2026", completed: null,           ini: "AK", color: "#EC4899", sessionId: "SES-4427" },
  { id: "C-008", name: "Tom Nguyen",      role: "DevOps Engineer",   score: null,status: "In Progress",rec: null,       scheduled: "Apr 25, 2026", completed: null,           ini: "TN", color: "#0EA5E9", sessionId: "SES-4428" },
  { id: "C-009", name: "Shreya Patel",    role: "Frontend Engineer", score: 55, status: "Completed",  rec: "Reject",    scheduled: "Apr 17, 2026", completed: "Apr 17, 2026", ini: "SP", color: "#F97316", sessionId: "SES-4429" },
  { id: "C-010", name: "Carlos Mendez",   role: "ML Engineer",       score: 82, status: "Completed",  rec: "Proceed",   scheduled: "Apr 16, 2026", completed: "Apr 16, 2026", ini: "CM", color: "#14B8A6", sessionId: "SES-4430" },
];

const STATUS_CONFIG = {
  "Scheduled":   { bg: "#E8E5FF", color: "#5929D0", icon: Clock,         label: "Scheduled"    },
  "In Progress": { bg: "#FEF3C7", color: "#D97706", icon: AlertCircle,   label: "In Progress"  },
  "Completed":   { bg: "#DCFCE7", color: "#16A34A", icon: CheckCircle2,  label: "Completed"    },
  "Escalated":   { bg: "#CFFAFE", color: "#0891B2", icon: ArrowUpRight,  label: "Escalated"    },
  "Rejected":    { bg: "#FEE2E2", color: "#DC2626", icon: XCircle,       label: "Rejected"     },
};

const REC_CONFIG = {
  "Proceed":  { bg: "#DCFCE7", color: "#16A34A" },
  "On Hold":  { bg: "#FEF3C7", color: "#D97706" },
  "Reject":   { bg: "#FEE2E2", color: "#DC2626" },
};

function Header({ onToggle }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: T.white, borderBottom: `1px solid ${T.navy7}`, padding: "13px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <button onClick={onToggle} style={{ background: T.navy8, border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Menu size={16} color={T.navy3} />
        </button>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <Search size={14} color={T.navy5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input placeholder="Search candidates by name, role, ID..." style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, border: `1px solid ${T.navy7}`, borderRadius: 10, fontSize: 13, fontFamily: FONT, color: T.navy2, background: T.navy8, outline: "none" }} />
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
  );
}

function StatPill({ label, count, color, bg }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14, padding: "14px 20px", display: "flex", flexDirection: "column", gap: 4, flex: "1 1 100px", minWidth: 100, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || T.navy0 }}>{count}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.navy4 }}>{label}</div>
      <div style={{ height: 3, borderRadius: 99, background: bg || T.primaryLight, marginTop: 2 }} />
    </div>
  );
}

export default function CandidatesPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeRole, setActiveRole] = useState("All Roles");
  const [hRow, setHRow] = useState(null);
  const SW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  const filtered = CANDIDATES.filter(c =>
    (activeStatus === "All" || c.status === activeStatus) &&
    (activeRole === "All Roles" || c.role === activeRole)
  );

  const counts = {
    Scheduled:   CANDIDATES.filter(c => c.status === "Scheduled").length,
    "In Progress": CANDIDATES.filter(c => c.status === "In Progress").length,
    Completed:   CANDIDATES.filter(c => c.status === "Completed").length,
    Escalated:   CANDIDATES.filter(c => c.status === "Escalated").length,
    Rejected:    CANDIDATES.filter(c => c.status === "Rejected").length,
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: FONT, background: T.bg }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} activeKey="candidates" />
      <div style={{ marginLeft: SW, flex: 1, height: "100vh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", transition: "margin-left .25s cubic-bezier(.4,0,.2,1)" }}>
        <Header onToggle={() => setCollapsed(v => !v)} />

        <main style={{ padding: "28px 30px 40px", flex: 1 }}>

          {/* Page Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 4, height: 28, borderRadius: 99, background: `linear-gradient(180deg,${T.primary},${T.pink})` }} />
                <h1 style={{ fontSize: 24, fontWeight: 800, color: T.navy0 }}>Candidates</h1>
              </div>
              <p style={{ fontSize: 13, color: T.navy4, marginLeft: 14 }}>ATS Interview Status Panel — all candidates across active roles</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 7, background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: T.navy2, cursor: "pointer", fontFamily: FONT }}>
                <Download size={14} /> Export
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: FONT }}>
                <Plus size={14} /> Add Candidate
              </button>
            </div>
          </div>

          {/* Stat Pills */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <StatPill label="Scheduled"   count={counts.Scheduled}     color={T.primary}  bg={T.primaryLight} />
            <StatPill label="In Progress" count={counts["In Progress"]} color="#D97706"    bg="#FEF3C7" />
            <StatPill label="Completed"   count={counts.Completed}     color={T.success}  bg={T.successLight} />
            <StatPill label="Escalated"   count={counts.Escalated}     color="#0891B2"    bg="#CFFAFE" />
            <StatPill label="Rejected"    count={counts.Rejected}      color={T.error}    bg={T.errorLight} />
            <StatPill label="Total"       count={CANDIDATES.length}    color={T.navy0}    bg={T.navy7} />
          </div>

          {/* Filters */}
          <div style={{ background: T.white, border: `1px solid ${T.navy7}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={14} color={T.navy4} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: T.navy4 }}>Filters:</span>
            </div>

            {/* Status tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setActiveStatus(s)} style={{
                  padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: FONT,
                  fontSize: 12, fontWeight: 600,
                  background: activeStatus === s ? T.primary : T.navy8,
                  color: activeStatus === s ? "#fff" : T.navy3,
                  transition: "all .15s",
                }}>{s}</button>
              ))}
            </div>

            <div style={{ width: 1, height: 24, background: T.navy7 }} />

            {/* Role dropdown */}
            <div style={{ position: "relative" }}>
              <select value={activeRole} onChange={e => setActiveRole(e.target.value)} style={{
                appearance: "none", background: T.navy8, border: `1px solid ${T.navy7}`,
                borderRadius: 8, padding: "7px 32px 7px 12px", fontSize: 12.5, fontWeight: 600,
                color: T.navy2, fontFamily: FONT, cursor: "pointer", outline: "none",
              }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown size={13} color={T.navy4} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>

            <div style={{ marginLeft: "auto", fontSize: 12, color: T.navy5, fontWeight: 500 }}>
              {filtered.length} of {CANDIDATES.length} candidates
            </div>
          </div>

          {/* Table */}
          <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.navy7}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: T.navy8, borderBottom: `1px solid ${T.navy7}` }}>
                    {["Candidate", "Role", "Session ID", "Scheduled", "Score", "Recommendation", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.navy4, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const sc = STATUS_CONFIG[c.status];
                    const StatusIcon = sc.icon;
                    return (
                      <tr key={c.id}
                        style={{ borderBottom: `1px solid ${T.navy7}`, background: hRow === i ? T.navy8 : T.white, transition: "background .12s", cursor: "default" }}
                        onMouseEnter={() => setHRow(i)} onMouseLeave={() => setHRow(null)}>

                        {/* Candidate */}
                        <td style={{ padding: "13px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.ini}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: T.navy0 }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: T.navy5 }}>{c.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: "13px 18px", fontSize: 13, color: T.navy3 }}>{c.role}</td>

                        {/* Session */}
                        <td style={{ padding: "13px 18px", fontSize: 12, fontFamily: "monospace", color: T.navy4 }}>{c.sessionId}</td>

                        {/* Scheduled */}
                        <td style={{ padding: "13px 18px", fontSize: 12.5, color: T.navy3, whiteSpace: "nowrap" }}>{c.scheduled}</td>

                        {/* Score */}
                        <td style={{ padding: "13px 18px" }}>
                          {c.score !== null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 44, height: 6, background: T.navy8, borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${c.score}%`, borderRadius: 999, background: c.score >= 85 ? T.success : c.score >= 70 ? T.warning : T.error }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: T.navy0 }}>{c.score}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: T.navy5 }}>—</span>
                          )}
                        </td>

                        {/* Recommendation */}
                        <td style={{ padding: "13px 18px" }}>
                          {c.rec ? (
                            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, ...REC_CONFIG[c.rec] }}>{c.rec}</span>
                          ) : (
                            <span style={{ fontSize: 12, color: T.navy5 }}>Pending</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, background: sc.bg, color: sc.color }}>
                            <StatusIcon size={12} />
                            {c.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "13px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button title="View Report" style={{ background: T.primaryLight, border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: T.primary, fontFamily: FONT }}>
                              <Eye size={13} /> Report
                            </button>
                            <button title="Send Email" style={{ background: T.navy8, border: "none", borderRadius: 7, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <Mail size={13} color={T.navy4} />
                            </button>
                            <button title="More" style={{ background: T.navy8, border: "none", borderRadius: 7, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <MoreHorizontal size={13} color={T.navy4} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.navy7}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: T.navy5 }}>Showing {filtered.length} results</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[1,2,3].map(p => (
                  <button key={p} style={{ width: 30, height: 30, borderRadius: 7, border: p === 1 ? "none" : `1px solid ${T.navy7}`, background: p === 1 ? T.primary : T.white, color: p === 1 ? "#fff" : T.navy3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}