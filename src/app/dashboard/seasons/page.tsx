"use client";

import React, { useState, useRef, useEffect } from "react";
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
  {
    id: 1,
    name: "2025-2026",
    description: "Upcoming season for 2025-2026",
    startDate: "2025-06-01",
    endDate: "2026-05-31",
  },
  {
    id: 2,
    name: "2026-2027",
    description: "Future season for 2026-2027",
    startDate: "2026-06-01",
    endDate: "2027-05-31",
  },
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
  const [computedMaxWidth, setComputedMaxWidth] = useState("100%");

  // Ref to measure the container's rendered width.
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const measuredWidth = containerRef.current.offsetWidth;
      setComputedMaxWidth(`${measuredWidth}px`);
    }
  }, []);

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
    {
      field: "name",
      headerName: "Season Name",
      flex: 1,
      minWidth: 150,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 200,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 150,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerClassName: "super-app-theme--header",
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
    <Box
      ref={containerRef}
      sx={{ width: "100%", p: 2, maxWidth: computedMaxWidth }}
    >
      {/* Page Heading */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Seasons
      </Typography>

      {/* Search & Add Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search seasons..."
          size="small"
          sx={{ width: 200 }}
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

      {/* Data Grid */}
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          disableColumnMenu
          sx={{
            width: "100%",
            bgcolor: "white",
            "& .MuiDataGrid-cell": { bgcolor: "white" },
            "& .MuiDataGrid-footerContainer": { bgcolor: "white" },
            "& .super-app-theme--header": {
              backgroundColor: "#1976d2",
              color: "white",
              fontWeight: 700,
              borderBottom: "2px solid #115293",
            },
          }}
        />
      </Box>

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
