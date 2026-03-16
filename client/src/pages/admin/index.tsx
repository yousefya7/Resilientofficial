import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLogin from "./login";
import AdminDashboard from "./dashboard";

export default function AdminPage() {
  const [forceShow, setForceShow] = useState(false);

  const { data: authData, isLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  if (isLoading) return null;

  const isAuthenticated = authData?.authenticated || forceShow;

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setForceShow(true)} />;
  }

  return <AdminDashboard />;
}
