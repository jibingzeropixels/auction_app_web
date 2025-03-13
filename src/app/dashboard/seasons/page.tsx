"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const rows = [
  { id: 1, name: "2025-2026", startDate: "2025-06-01", endDate: "2026-05-31" },
  { id: 2, name: "2026-2027", startDate: "2026-06-01", endDate: "2027-05-31" },
];

export default function SeasonsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const handleRowClick = (seasonId: number) => {
    router.push(`/dashboard/seasons/${seasonId}`);
  };

  const handleEdit = (seasonId: number) => {
    router.push(`/dashboard/seasons/add?edit=${seasonId.toString()}`);
  };

  const handleDelete = () => {
    if (selectedSeason !== null) {
      console.log(`Deleting season ${selectedSeason}`);
      setOpen(false);
    }
  };

  const handleOpenDialog = (seasonId: number) => {
    setSelectedSeason(seasonId);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
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
              event.stopPropagation();
              handleEdit(params.row.id);
            }}
            color="primary"
          >
            Edit
          </Button>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              handleOpenDialog(params.row.id);
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
          onRowClick={(params) => handleRowClick(params.row.id)}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this season?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
