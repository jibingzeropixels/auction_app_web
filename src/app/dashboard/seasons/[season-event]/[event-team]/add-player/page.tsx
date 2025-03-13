"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { TextField, Button, Box } from "@mui/material";

export default function AddPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { "season-event": seasonId, "event-team": eventId } = useParams();
  const editId = searchParams.get("edit");

  const [playerData, setPlayerData] = useState({ name: "", team: "" });

  useEffect(() => {
    if (editId) {
      setPlayerData({ name: "Virat Kohli", team: "RCB" });
    }
  }, [editId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(editId ? "Updating player:" : "Adding new player:", playerData);
    router.push(`/dashboard/seasons/${seasonId}/${eventId}`);
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Player Name"
          fullWidth
          required
          value={playerData.name}
          onChange={(e) =>
            setPlayerData({ ...playerData, name: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          {editId ? "Update" : "Add"} Player
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
