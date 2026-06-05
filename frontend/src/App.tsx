import { useQuery } from "@tanstack/react-query";
import axios from "./api/axios";

interface HealthResponse {
  success: boolean;
  data: {
    status: string;
    db: string;
    timestamp: string;
  };
  message: string;
}

function App() {
  const { data, isLoading, error } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await axios.get("/health");
      return res.data;
    },
    retry: 1,
  });

  if (isLoading) {
    return <div>Connecting...</div>;
  }

  if (error || data?.data.db === "error") {
    return <div style={{ color: "red" }}>❌ Cannot reach backend</div>;
  }

  return (
    <div style={{ color: "green" }}>
      ✅ System Connected (db: {data?.data.db})
    </div>
  );
}

export default App;
