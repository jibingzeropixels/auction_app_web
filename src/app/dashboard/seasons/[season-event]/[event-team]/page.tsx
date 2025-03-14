// src/app/dashboard/seasons/[event-name]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";

export default function TeamsPage() {
  const { "season-event": seasonId, "event-team": eventId } = useParams();

  const rows = [
    { id: 1, name: "Mumbai Indians", eventId: 1 },
    { id: 2, name: "CSK", eventId: 1 },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={[{ field: "name", headerName: "Team Name", width: 250 }]}
    />
  );
}
