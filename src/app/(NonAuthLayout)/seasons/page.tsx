"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";

export default function SeasonsPage() {
  const router = useRouter();

  const rows = [
    { id: 1, seasonName: "2025-2026" },
    { id: 2, seasonName: "2026-2027" },
    { id: 3, seasonName: "2025-2026" },
    { id: 4, seasonName: "2026-2027" },
    { id: 5, seasonName: "2025-2026" },
    { id: 6, seasonName: "2026-2027" },
    { id: 7, seasonName: "2025-2026" },
    { id: 8, seasonName: "2026-2027" },
    { id: 9, seasonName: "2027-2028" },
  ];

  const handleRowClick = (seasonName: any) => {
    router.push(`/seasons/${encodeURIComponent(seasonName)}`);
  };

  return (
    <DataGrid
      rows={rows}
      columns={[{ field: "seasonName", headerName: "Season Name", width: 250 }]}
      onRowClick={(params) => handleRowClick(params.row.seasonName)}
    />
  );
}
