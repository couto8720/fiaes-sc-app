"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "up" | "down";
  };
  icon: ReactNode;
  color?: "vitoria" | "derrota" | "destaque" | "azul";
}

export function StatCard({ title, value, change, icon, color = "azul" }: StatCardProps) {
  const bgColor = {
    vitoria: "bg-vitoria/10 border-vitoria/30",
    derrota: "bg-derrota/10 border-derrota/30",
    destaque: "bg-destaque/10 border-destaque/30",
    azul: "bg-azul/10 border-azul/30",
  }[color];

  const textColor = {
    vitoria: "text-vitoria",
    derrota: "text-derrota",
    destaque: "text-destaque",
    azul: "text-azul",
  }[color];

  return (
    <div className={`rounded-lg border ${bgColor} p-6 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className={`text-3xl ${textColor}`}>{icon}</span>
        {change && (
          <span className={`text-sm font-semibold ${change.type === "up" ? "text-vitoria" : "text-derrota"}`}>
            {change.type === "up" ? "↑" : "↓"} {Math.abs(change.value)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-suave">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export function StatsGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>;
}
