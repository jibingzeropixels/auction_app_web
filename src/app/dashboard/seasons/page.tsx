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
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { seasonsService } from "@/services/seasons"; // Adjust the import path as needed

export default function SeasonsPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<any[]>([]);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<{
    _id: string;
    name: string;
  } | null>(null);
  const [computedMaxWidth, setComputedMaxWidth] = useState("100%");
  const [loading, setLoading] = useState(true);

  // Ref to measure the container's rendered width.
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const measuredWidth = containerRef.current.offsetWidth;
      setComputedMaxWidth(`${measuredWidth}px`);
    }
  }, []);

  // Fetch seasons from the backend using the seasonsService.
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await seasonsService.getAllSeasons();
        setSeasons(data || []);
        setFilteredRows(data || []);
      } catch (error) {
        console.error("Error fetching seasons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasons();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredRows(
      seasons.filter((row) => row.name.toLowerCase().includes(value))
    );
  };

  // Updated handleEdit passes full season details via query parameters
  const handleEdit = (row: any) => {
    const { _id, name, desc, startDate, endDate } = row;
    router.push(
      `/dashboard/seasons/add?edit=${_id}&name=${encodeURIComponent(
        name
      )}&desc=${encodeURIComponent(desc)}&startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`
    );
  };

  const handleDeleteClick = (season: { _id: string; name: string }) => {
    setSelectedSeason(season);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedSeason) {
      try {
        await seasonsService.deleteSeason(selectedSeason._id);
        // Remove deleted season from state
        const updatedSeasons = seasons.filter(
          (s) => s._id !== selectedSeason._id
        );
        setSeasons(updatedSeasons);
        setFilteredRows(updatedSeasons);
      } catch (error) {
        console.error("Delete failed:", error);
      }
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
      field: "desc", // Adjust field to match your API response
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
      renderCell: (params) =>
        params.value ? String(params.value).slice(0, 10) : "",
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      headerClassName: "super-app-theme--header",
      renderCell: (params) =>
        params.value ? String(params.value).slice(0, 10) : "",
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
              handleEdit(params.row);
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
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            disableColumnMenu
            getRowId={(row) => row._id}
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
        )}
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
