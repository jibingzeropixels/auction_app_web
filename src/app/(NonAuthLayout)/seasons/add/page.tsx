"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, Button, Box } from "@mui/material";

export default function AddSeasonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [seasonData, setSeasonData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (editId) {
      // Fetch season details from API (mocked here)
      setSeasonData({
        name: "2025-2026",
        description: "Upcoming Season",
        startDate: "2025-06-01",
        endDate: "2026-05-31",
      });
    }
  }, [editId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      console.log("Updating season:", seasonData);
    } else {
      console.log("Adding new season:", seasonData);
    }
    router.push("/seasons");
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Season Name"
          fullWidth
          required
          value={seasonData.name}
          onChange={(e) =>
            setSeasonData({ ...seasonData, name: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          value={seasonData.description}
          onChange={(e) =>
            setSeasonData({ ...seasonData, description: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Start Date"
          type="date"
          fullWidth
          required
          slotProps={{ inputLabel: { shrink: true } }}
          value={seasonData.startDate}
          onChange={(e) =>
            setSeasonData({ ...seasonData, startDate: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="End Date"
          type="date"
          fullWidth
          required
          slotProps={{ inputLabel: { shrink: true } }}
          value={seasonData.endDate}
          onChange={(e) =>
            setSeasonData({ ...seasonData, endDate: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          {editId ? "Update" : "Add"} Season
        </Button>
        <Button variant="outlined" onClick={() => router.push("/seasons")}>
          Cancel
        </Button>
      </form>
    </Box>
  );
}
