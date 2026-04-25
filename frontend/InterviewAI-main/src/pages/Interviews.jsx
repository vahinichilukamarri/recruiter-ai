import React from "react";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: "20px 24px",
    boxSizing: "border-box",
    background: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    marginBottom: "16px"
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "16px"
  },
  card: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "12px"
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minWidth: 0
  },
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "16px"
  },
  tableWrap: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "16px",
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  thtd: {
    padding: "12px",
    borderBottom: "1px solid #334155",
    textAlign: "left"
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  widget: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "12px"
  },
  graph: {
    height: "150px",
    background: "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px"
  }
};

const InterviewDashboard = () => {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Interview Dashboard</h2>
      </div>

      <div style={styles.summary}>
        <div style={styles.card}>Total Interviews: 24</div>
        <div style={styles.card}>Scheduled: 10</div>
        <div style={styles.card}>Completed: 8</div>
        <div style={styles.card}>Pending: 6</div>
      </div>

      <div style={styles.main}>
        <div style={styles.body}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thtd}>Candidate</th>
                  <th style={styles.thtd}>Role</th>
                  <th style={styles.thtd}>Status</th>
                  <th style={styles.thtd}>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.thtd}>John Doe</td>
                  <td style={styles.thtd}>Frontend Dev</td>
                  <td style={styles.thtd}>Scheduled</td>
                  <td style={styles.thtd}>May 2</td>
                </tr>
                <tr>
                  <td style={styles.thtd}>Jane Smith</td>
                  <td style={styles.thtd}>Backend Dev</td>
                  <td style={styles.thtd}>Completed</td>
                  <td style={styles.thtd}>Apr 28</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.widget}>
              <h4>Upcoming</h4>
              <p>3 interviews today</p>
            </div>

            <div style={styles.widget}>
              <h4>Performance</h4>
              <p>80% success rate</p>
            </div>

            <div style={styles.widget}>
              <h4>Graph</h4>
              <div style={styles.graph}>
                <span>Graph Widget</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDashboard;
