"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import { teamsService } from "@/services/teams";

interface FormData {
  name: string;
  description: string;
  seasonId: string;
  eventId: string;
}

interface Season {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  name: string;
  seasonId: string;
}

export default function AddTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTeamId = searchParams.get("edit");
  const prepopulatedName = searchParams.get("name") || "";
  const prepopulatedDesc = searchParams.get("desc") || "";
  const prepopulatedSeasonId = searchParams.get("seasonId") || "";
  const prepopulatedEventId = searchParams.get("eventId") || "";

  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    seasonId: "",
    eventId: "",
  });

  // Fetch seasons and events on mount.
  useEffect(() => {
    async function fetchData() {
      try {
        const seasonsData = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);
        const eventsData = await eventsService.getAllEvents();
        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  // Pre-populate form in edit mode.
  useEffect(() => {
    if (editTeamId) {
      setFormData({
        name: prepopulatedName,
        description: prepopulatedDesc,
        seasonId: prepopulatedSeasonId,
        eventId: prepopulatedEventId,
      });
    }
  }, [
    editTeamId,
    prepopulatedName,
    prepopulatedDesc,
    prepopulatedSeasonId,
    prepopulatedEventId,
  ]);

  // Check authorization.
  if (user?.role !== "superAdmin" && user?.role !== "eventAdmin") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          You don&apos;t have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/dashboard")}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Box>
    );
  }

  // Handler for text fields.
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for the Select components.
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Team name is required");
      return false;
    }
    // Only validate season and event if in create mode.
    if (!editTeamId) {
      if (!formData.seasonId) {
        setError("Season is required");
        return false;
      }
      if (!formData.eventId) {
        setError("Event is required");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editTeamId) {
        await teamsService.updateTeam({
          teamId: editTeamId,
          name: formData.name,
          desc: formData.description,
          // In edit mode, season and event remain unchanged.
        });
        setSuccess("Team updated successfully");
      } else {
        await teamsService.createTeam({
          eventId: formData.eventId,
          name: formData.name,
          desc: formData.description,
          createdBy: user?.id,
        });
        setSuccess("Team created successfully");
        setFormData({
          name: "",
          description: "",
          seasonId: "",
          eventId: "",
        });
      }
      setTimeout(() => {
        router.push("/dashboard/teams");
      }, 2000);
    } catch (err: unknown) {
      console.error("Error:", err);
      setError("Failed to save team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/teams");
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    router.push(path);
  };

  // For create mode, filter events by selected season.
  const filteredEvents =
    !editTeamId && formData.seasonId
      ? events.filter((event) => event.seasonId === formData.seasonId)
      : events;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            color="inherit"
            href="/dashboard/teams"
            onClick={(e) => handleLinkClick(e, "/dashboard/teams")}
          >
            Teams
          </Link>
          <Typography color="text.primary">
            {editTeamId ? "Edit Team" : "Add Team"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {editTeamId ? "Edit Team" : "Add New Team"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Team Name"
              value={formData.name}
              onChange={handleTextChange}
              error={error.includes("name")}
              helperText={error.includes("name") ? "Team name is required" : ""}
            />

            {/* Only show Season and Event dropdowns in create mode */}
            {!editTeamId && (
              <>
                <FormControl
                  fullWidth
                  required
                  error={error.includes("Season")}
                >
                  <InputLabel id="season-label">Season</InputLabel>
                  <Select
                    labelId="season-label"
                    id="seasonId"
                    name="seasonId"
                    value={formData.seasonId}
                    label="Season"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">
                      <em>Select a Season</em>
                    </MenuItem>
                    {seasons.map((season) => (
                      <MenuItem key={season._id} value={season._id}>
                        {season.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {error.includes("Season") && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      Season is required
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth required error={error.includes("Event")}>
                  <InputLabel id="event-label">Event</InputLabel>
                  <Select
                    labelId="event-label"
                    id="eventId"
                    name="eventId"
                    value={formData.eventId}
                    label="Event"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">
                      <em>Select an Event</em>
                    </MenuItem>
                    {filteredEvents.map((event) => (
                      <MenuItem key={event._id} value={event._id}>
                        {event.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {error.includes("Event") && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      Event is required
                    </Typography>
                  )}
                </FormControl>
              </>
            )}

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleTextChange}
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ minWidth: "100px" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: "100px" }}
              >
                {loading
                  ? editTeamId
                    ? "Updating..."
                    : "Creating..."
                  : editTeamId
                  ? "Update Team"
                  : "Add Team"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
