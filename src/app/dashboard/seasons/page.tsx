"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const initialRows = [
  { id: 1, name: "2025-2026", startDate: "2025-06-01", endDate: "2026-05-31" },
  { id: 2, name: "2026-2027", startDate: "2026-06-01", endDate: "2027-05-31" },
];

export default function SeasonsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredRows(
      initialRows.filter((row) => row.name.toLowerCase().includes(value))
    );
  };

  const handleEdit = (seasonId: number) => {
    router.push(`/dashboard/seasons/add?edit=${seasonId}`);
  };

  const handleDeleteClick = (season: { id: number; name: string }) => {
    setSelectedSeason(season);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedSeason) {
      console.log(`Deleting season ${selectedSeason.id}`);
      // TODO: Add actual delete logic here
    }
    setOpenDeleteDialog(false);
    setSelectedSeason(null);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Season Name", width: 200 },
    { field: "startDate", headerName: "Start Date", width: 150 },
    { field: "endDate", headerName: "End Date", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(params.row.id);
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteClick(params.row);
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Search & Add Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search seasons..."
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/dashboard/seasons/add")}
        >
          Add Season
        </Button>
      </Box>

      {/* Data Grid with White Background */}

      <DataGrid
        rows={filteredRows}
        columns={columns}
        sx={{
          bgcolor: "white", // ✅ Only Data Grid background is white
          "& .MuiDataGrid-cell": { bgcolor: "white" },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "white",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-footerContainer": { bgcolor: "white" },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the season{" "}
            <strong>{selectedSeason?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
