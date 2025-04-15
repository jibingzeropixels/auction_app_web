"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { eventsService } from "@/services/events";

// Define the Event type
type Event = {
  _id: string;
  name: string;
  seasonId: string;
  auctionStatus: "pending" | "declared" | "in-progress" | "completed";
  auctionId?: string;
};

const SelectAuctionPage = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch all events (assumed to be already filtered for team admin)
        const eventsData: Event[] = await eventsService.getAllEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Team Admin Events
        </Typography>
        {events.length === 0 ? (
          <Typography>No events available.</Typography>
        ) : (
          <List>
            {events
              .filter((event) => event.auctionStatus !== "completed")
              .map((event) => (
                <ListItem
                  key={event._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <ListItemText
                    primary={event.name}
                    secondary={`Auction Status: ${event.auctionStatus}`}
                  />
                  {event.auctionStatus === "in-progress" && event.auctionId ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        router.push(
                          `/dashboard/auction?auctionId=${event.auctionId}&eventId=${event._id}`
                        )
                      }
                    >
                      Go to Auction
                    </Button>
                  ) : (
                    <Button variant="contained" disabled>
                      Not in Auction
                    </Button>
                  )}
                </ListItem>
              ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default SelectAuctionPage;
