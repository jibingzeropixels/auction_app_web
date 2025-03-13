// src/app/dashboard/seasons/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Box } from "@mui/material";

const rows = [
  { id: 1, name: "2025-2026", startDate: "2025-06-01", endDate: "2026-05-31" },
  { id: 2, name: "2026-2027", startDate: "2026-06-01", endDate: "2027-05-31" },
];

export default function SeasonsPage() {
  const router = useRouter();

  const handleRowClick = (seasonId: number) => {
    router.push(`/dashboard/seasons/${seasonId}`);
  };

  const handleEdit = (seasonId: number) => {
    router.push(`/dashboard/seasons/add?edit=${seasonId.toString()}`);
  };

  const handleDelete = (seasonId: number) => {
    if (window.confirm("Are you sure you want to delete this season?")) {
      console.log(`Deleting season ${seasonId}`);
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Season Name", width: 200 },
    { field: "startDate", headerName: "Start Date", width: 150 },
    { field: "endDate", headerName: "End Date", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            onClick={(event) => {
              event.stopPropagation(); // ✅ Prevents row click
              handleEdit(params.row.id);
            }}
            color="primary"
          >
            Edit
          </Button>
          <Button
            onClick={(event) => {
              event.stopPropagation(); // ✅ Prevents row click
              handleDelete(params.row.id);
            }}
            color="error"
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/dashboard/seasons/add")}
        >
          Add Season
        </Button>
      </Box>

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          onRowClick={(params) => handleRowClick(params.row.id)} // ✅ Fixed here
        />
      </Box>
    </Box>
  );
}
