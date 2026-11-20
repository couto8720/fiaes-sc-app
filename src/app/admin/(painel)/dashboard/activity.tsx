"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Activity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  timestamp: string;
  status: "success" | "failure";
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("audit_logs" as any)
          .select("id, user_id, action, resource_type, created_at as timestamp, status")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setActivities((data || []) as unknown as Activity[]);
      } catch (err) {
        console.error("Erro ao carregar atividades:", err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-suave">A carregar atividades...</div>;
  }

  return (
    <div className="bg-site rounded-lg border border-borda p-6">
      <h2 className="text-lg font-bold mb-4">Atividades Recentes</h2>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-suave">Sem atividades registadas</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-borda last:border-0">
              <div>
                <p className="font-semibold text-sm">
                  {activity.action.replace(/_/g, " ").toLocaleUpperCase("pt-PT")}
                </p>
                <p className="text-xs text-suave">
                  {activity.resource_type} · {new Date(activity.timestamp).toLocaleString("pt-PT")}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  activity.status === "success"
                    ? "bg-vitoria/20 text-vitoria"
                    : "bg-derrota/20 text-derrota"
                }`}
              >
                {activity.status === "success" ? "✓ OK" : "✗ Erro"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
