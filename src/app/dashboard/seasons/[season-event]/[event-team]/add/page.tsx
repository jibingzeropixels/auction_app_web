"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { TextField, Button, Box } from "@mui/material";

export default function AddTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { "season-event": seasonId, "event-team": eventId } = useParams();
  const editId = searchParams.get("edit");

  const [teamData, setTeamData] = useState({ name: "" });

  useEffect(() => {
    if (editId) {
      setTeamData({ name: "RCB" });
    }
  }, [editId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(editId ? "Updating team:" : "Adding new team:", teamData);
    router.push(`/dashboard/seasons/${seasonId}/${eventId}`);
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Team Name"
          fullWidth
          required
          value={teamData.name}
          onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          {editId ? "Update" : "Add"} Team
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            router.push(`/dashboard/seasons/${seasonId}/${eventId}`)
          }
        >
          Cancel
        </Button>
      </form>
    </Box>
  );
}
