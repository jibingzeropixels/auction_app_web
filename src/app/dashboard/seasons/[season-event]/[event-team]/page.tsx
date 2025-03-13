"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function TeamsPage() {
  const router = useRouter();
  const { "season-event": seasonId, "event-team": eventId } = useParams();
  const [tab, setTab] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"team" | "player" | null>(null);

  const teams = [
    { id: 1, name: "RCB" },
    { id: 2, name: "CSK" },
  ];

  const players = [
    { id: 1, name: "Virat Kohli", team: "RCB" },
    { id: 2, name: "MS Dhoni", team: "CSK" },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleEdit = (id: number, type: "team" | "player") => {
    const path = type === "team" ? "add" : "add-player";
    router.push(`/dashboard/seasons/${seasonId}/${eventId}/${path}?edit=${id}`);
  };

  const handleOpenDeleteDialog = (id: number, type: "team" | "player") => {
    setDeleteId(id);
    setDeleteType(type);
    setOpenDeleteDialog(true);
  };

  const handleDelete = () => {
    if (deleteId !== null && deleteType) {
      console.log(`Deleting ${deleteType}: ${deleteId}`);
      setOpenDeleteDialog(false);
    }
  };

  const teamColumns: GridColDef[] = [
    { field: "name", headerName: "Team Name", width: 250 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            color="primary"
            onClick={() => handleEdit(params.row.id, "team")}
          >
            Edit
          </Button>
          <Button
            color="error"
            onClick={() => handleOpenDeleteDialog(params.row.id, "team")}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const playerColumns: GridColDef[] = [
    { field: "name", headerName: "Player Name", width: 200 },
    { field: "team", headerName: "Team", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            color="primary"
            onClick={() => handleEdit(params.row.id, "player")}
          >
            Edit
          </Button>
          <Button
            color="error"
            onClick={() => handleOpenDeleteDialog(params.row.id, "player")}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Teams" />
          <Tab label="Players Available" />
        </Tabs>

        {tab === 0 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              router.push(`/dashboard/seasons/${seasonId}/${eventId}/add`)
            }
          >
            Add Team
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              router.push(
                `/dashboard/seasons/${seasonId}/${eventId}/add-player`
              )
            }
          >
            Add Player
          </Button>
        )}
      </Box>

      {tab === 0 ? (
        <DataGrid rows={teams} columns={teamColumns} />
      ) : (
        <DataGrid rows={players} columns={playerColumns} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {deleteType}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
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
