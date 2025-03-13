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
  { id: 1, name: "Event 1", date: "2025-06-10" },
  { id: 2, name: "Event 2", date: "2025-07-15" },
];

export default function EventsPage({
  params,
}: {
  params: { "season-event": string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const handleRowClick = (eventId: number) => {
    router.push(`/dashboard/seasons/${params["season-event"]}/${eventId}`);
  };

  const handleEdit = (eventId: number) => {
    router.push(
      `/dashboard/seasons/${params["season-event"]}/add?edit=${eventId}`
    );
  };

  const handleDelete = () => {
    if (selectedEvent !== null) {
      console.log(`Deleting event ${selectedEvent}`);
      setOpen(false);
    }
  };

  const handleOpenDialog = (eventId: number) => {
    setSelectedEvent(eventId);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Event Name", width: 200 },
    { field: "date", headerName: "Event Date", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row.id);
            }}
            color="primary"
          >
            Edit
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
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
          onClick={() =>
            router.push(`/dashboard/seasons/${params["season-event"]}/add`)
          }
        >
          Add Event
        </Button>
      </Box>

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          onRowClick={(params) => handleRowClick(params.row.id)}
        />
      </Box>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event?
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
