"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";

export default function SeasonsPage() {
  const router = useRouter();

  const rows = [
    { id: 1, seasonName: "IPL 2025" },
    { id: 2, seasonName: "T20 World Cup" },
    { id: 3, seasonName: "IPL 2025" },
    { id: 4, seasonName: "T20 World Cup" },
    { id: 5, seasonName: "IPL 2025" },
    { id: 6, seasonName: "T20 World Cup" },
    { id: 7, seasonName: "IPL 2025" },
    { id: 8, seasonName: "T20 World Cup" },
    { id: 9, seasonName: "IPL 2025" },
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
