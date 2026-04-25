import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [
          summary,
          candidates,
          decisionPie,
          interviewStatus,
          departmentBar,
          weeklyTrend,
        ] = await Promise.all([
          api.summary(),
          api.candidates(),
          api.decisionPie(),
          api.interviewStatus(),
          api.departmentBar(),
          api.weeklyTrend(),
        ]);

        setData({
          summary,
          candidates,
          decisionPie,
          interviewStatus,
          departmentBar,
          weeklyTrend,
        });
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { loading, error, data };
}