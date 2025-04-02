"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  FormControl,
  Autocomplete,
  TextField,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { eventsService } from "@/services/events";
import { seasonsService } from "@/services/seasons";

interface Season {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  name: string;
  auctionStatus: "pending" | "declared" | "in-progress" | "completed";
  seasonId: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

const DeclareAuctionPage = () => {
  const router = useRouter();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [basePrice, setBasePrice] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch seasons and events from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const seasonsData: Season[] = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);

        const eventsData: Event[] = await eventsService.getAllEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter events based on selected season
  useEffect(() => {
    if (selectedSeason) {
      setFilteredEvents(
        events.filter((e) => e.seasonId === selectedSeason._id)
      );
    } else {
      setFilteredEvents(events);
    }
    // Clear selected event when season changes.
    setSelectedEvent(null);
  }, [selectedSeason, events]);

  const handleSeasonChange = (_: any, value: Season | null) => {
    setSelectedSeason(value);
  };

  const handleEventChange = (_: any, value: Event | null) => {
    setSelectedEvent(value);
  };

  const handleDeclareAuction = async () => {
    if (!selectedEvent || selectedEvent.auctionStatus !== "pending") return;

    const payload = {
      basePrice: Number(basePrice),
      eventId: selectedEvent._id,
      budget: Number(budget),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auctions/declareAuction`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.message || "Failed to declare auction");
      }

      const data = await res.json();
      // Redirect to dashboard/auction with auctionId as query parameter.
      router.push(`/dashboard/auction?auctionId=${data.auctionId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error declaring auction:", err.message);
        alert(err.message);
      } else {
        console.error("Error declaring auction:", err);
        alert("An unknown error occurred.");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Declare Auction
      </Typography>

      {/* Season and Event Dropdowns */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl fullWidth>
          <Autocomplete
            options={seasons}
            getOptionLabel={(option) => option.name}
            onChange={handleSeasonChange}
            renderInput={(params) => (
              <TextField {...params} label="Select Season" />
            )}
          />
        </FormControl>
        <FormControl fullWidth>
          <Autocomplete
            options={filteredEvents}
            getOptionLabel={(option) => option.name}
            onChange={handleEventChange}
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              return (
                <li key={option._id} {...rest}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>{option.name}</span>
                    <Chip
                      label={option.auctionStatus}
                      size="small"
                      color={
                        option.auctionStatus === "pending"
                          ? "warning"
                          : option.auctionStatus === "declared"
                          ? "success"
                          : option.auctionStatus === "in-progress"
                          ? "info"
                          : "default"
                      }
                    />
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Event" />
            )}
          />
        </FormControl>
      </Box>

      {/* Conditional fields for a pending event */}
      {selectedEvent && selectedEvent.auctionStatus === "pending" && (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Base Price"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            fullWidth
          />
          <TextField
            label="Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            fullWidth
          />
        </Box>
      )}

      {/* Button to declare auction */}
      {selectedEvent && selectedEvent.auctionStatus === "pending" && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleDeclareAuction}
        >
          Declare Auction
        </Button>
      )}
    </Box>
  );
};

export default DeclareAuctionPage;
