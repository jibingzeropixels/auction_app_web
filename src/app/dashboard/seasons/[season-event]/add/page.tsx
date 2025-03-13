"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, Button, Box } from "@mui/material";

export default function AddEventPage({
  params,
}: {
  params: { "season-event": string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [eventData, setEventData] = useState({
    name: "",
    date: "",
  });

  useEffect(() => {
    if (editId) {
      setEventData({ name: "Event 1", date: "2025-06-10" });
    }
  }, [editId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(editId ? "Updating event:" : "Adding new event:", eventData);
    router.push(`/dashboard/seasons/${params["season-event"]}`);
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Event Name"
          fullWidth
          required
          value={eventData.name}
          onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Event Date"
          type="date"
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          value={eventData.date}
          onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          {editId ? "Update" : "Add"} Event
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            router.push(`/dashboard/seasons/${params["season-event"]}`)
          }
        >
          Cancel
        </Button>
      </form>
    </Box>
  );
}
