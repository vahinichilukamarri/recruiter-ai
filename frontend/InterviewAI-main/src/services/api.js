const BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `API Error: ${url}`;

    try {
      const err = await res.json();
      message = err.detail || message;
    } catch {
      // ignore parse fail
    }

    throw new Error(message);
  }

  return res.json();
}

export const api = {
  // ---------------- Dashboard ----------------
  summary: () =>
    request("/api/dashboard/summary"),

  decisionPie: () =>
    request("/api/charts/decision-pie"),

  interviewStatus: () =>
    request("/api/charts/interview-status"),

  departmentBar: () =>
    request("/api/charts/department-bar"),

  weeklyTrend: () =>
    request("/api/charts/weekly-trend"),

  // ---------------- Candidates ----------------
  candidates: () =>
    request("/api/candidates"),

  candidateById: (id) =>
    request(`/api/candidates/${id}`),

  // ---------------- Assessments ----------------
  assessments: () =>
    request("/api/assessments"),

  assessmentById: (id) =>
    request(`/api/assessments/${id}`),

  // ---------------- Interviews ----------------
  interviews: () =>
    request("/api/interviews"),

  interviewsScheduled: () =>
    request("/api/interviews/scheduled"),

  interviewsCompleted: () =>
    request("/api/interviews/completed"),

  interviewsInProgress: () =>
    request("/api/interviews/in-progress"),

  // ---------------- Final Decisions ----------------
  finalDecisions: () =>
    request("/api/final-decisions"),

  selectedCandidates: () =>
    request("/api/final-decisions/selected"),

  rejectedCandidates: () =>
    request("/api/final-decisions/rejected"),

  holdCandidates: () =>
    request("/api/final-decisions/hold"),

  updateDecision: (
    candidateId,
    final_decision,
    recruiter_name = "Recruiter",
    decision_notes = ""
  ) =>
    request(`/api/final-decisions/${candidateId}`, {
      method: "PUT",
      body: JSON.stringify({
        final_decision,
        human_final_decision: true,
        recruiter_name,
        decision_notes,
      }),
    }),

  // ---------------- Agent Output ----------------
  agentOutputs: () =>
    request("/api/agent-output"),

  agentOutputById: (id) =>
    request(`/api/agent-output/${id}`),

  // ---------------- HR Feedback ----------------
  hrFeedback: () =>
    request("/api/hr-feedback"),

  submitHrFeedback: (payload) =>
    request("/api/hr-feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};