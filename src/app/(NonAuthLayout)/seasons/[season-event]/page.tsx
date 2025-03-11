"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";

export default function EventsPage() {
  const { "season-event": seasonId } = useParams();
  const router = useRouter();

  const rows = [
    { id: 1, name: "Mens Cricket", seasonId: 1 },
    { id: 2, name: "Womens Cricket", seasonId: 1 },
  ];

  const handleRowClick = (id: any) => {
    router.push(`/seasons/${seasonId}/${id}`);
  };

  return (
    <DataGrid
      rows={rows}
      columns={[{ field: "name", headerName: "Event Name", width: 250 }]}
      onRowClick={(params) => handleRowClick(params.row.name)}
    />
  );
}
