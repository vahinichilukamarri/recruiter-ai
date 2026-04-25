import { Routes, Route } from "react-router-dom";

import Desktop from "./pages/Desktop";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import FinalEvaluated from "./pages/FinalEvaluated";
//import Analytics from "./pages/Analytics";

/*
  IMPORTANT: <Sidebar /> is rendered INSIDE each page (Dashboard, FinalEvaluated, etc.)
  because each page owns its own collapsed/expanded state and wires it to the
  top-bar hamburger button. Do NOT render <Sidebar /> here in App.jsx — that would
  create two sidebars stacked on top of each other.
*/

function App() {
  return (
    <Routes>
      {/* Public Page */}
      <Route path="/" element={<Desktop />} />

      {/* Recruiter Pages — each renders its own Sidebar internally */}
      <Route path="/dashboard"        element={<Dashboard />} />
      <Route path="/candidates"       element={<Candidates />} />
      <Route path="/interviews"       element={<Interviews />} />
      <Route path="/final-evaluated"  element={<FinalEvaluated />} />
      {/* <Route path="/analytics"      element={<Analytics />} /> */}
    </Routes>
  );
}

export default App;