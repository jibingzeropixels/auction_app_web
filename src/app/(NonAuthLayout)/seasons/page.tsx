"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";

export default function SeasonsPage() {
  const router = useRouter();

  const rows = [
    { id: 1, seasonName: "IPL 2025" },
    { id: 2, seasonName: "T20 World Cup" },
  ];

  const handleRowClick = (id: any) => {
    router.push(`/seasons/${id}`);
  };

  return (
    <DataGrid
      rows={rows}
      columns={[{ field: "seasonName", headerName: "Season Name", width: 250 }]}
      onRowClick={(params) => handleRowClick(params.row.id)}
    />
  );
}
