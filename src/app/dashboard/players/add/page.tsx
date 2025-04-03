"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Chip,
  FormHelperText,
  Switch,
  FormControlLabel,
  Autocomplete,
  SelectChangeEvent,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import { playersService } from "@/services/players-service";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  isIcon: boolean;
  eventId: string;
  seasonId: string;
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

export default function AddPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if individual firstName/lastName exist; otherwise, parse from a "name" query parameter.
  let initialFirstName = searchParams.get("firstName") || "";
  let initialLastName = searchParams.get("lastName") || "";
  const nameParam = searchParams.get("name");
  if (nameParam && !initialFirstName && !initialLastName) {
    const parts = nameParam.split(" ");
    initialFirstName = parts[0] || "";
    initialLastName = parts.slice(1).join(" ") || "";
  }

  const initialEventId = searchParams.get("eventId") || "";
  const initialEmail = searchParams.get("email") || "";

  // Parse skills from the URL query parameter.
  const initialSkills = useMemo(() => {
    const skillsParam = searchParams.get("skills");
    if (skillsParam) {
      try {
        // Check if the skills parameter starts with '[' indicating a JSON array.
        if (skillsParam.trim().startsWith("[")) {
          const parsedSkills = JSON.parse(decodeURIComponent(skillsParam));
          if (
            Array.isArray(parsedSkills) &&
            parsedSkills.every((item) => typeof item === "string")
          ) {
            return parsedSkills;
          }
        } else {
          // If not a JSON array, treat it as a single skill string.
          return [skillsParam];
        }
      } catch (e) {
        console.error("Failed to parse skills JSON from URL:", e);
      }
    }
    return [];
  }, [searchParams]);

  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [formData, setFormData] = useState<FormData>({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: initialEmail,
    phone: searchParams.get("phone") || "",
    skills: initialSkills, // Prepopulate skills here
    isIcon: false,
    eventId: initialEventId,
    seasonId: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [seasonsData, eventsData] = await Promise.all([
          seasonsService.getAllSeasons(),
          eventsService.getAllEvents(),
        ]);

        if (isMounted) {
          setSeasons(seasonsData);
          setEvents(eventsData);

          const targetEventId = initialEventId || formData.eventId;
          if (targetEventId) {
            const foundEvent = eventsData.find(
              (ev: Event) => ev._id === targetEventId
            );
            if (foundEvent) {
              setFormData((prev) => ({
                ...prev,
                seasonId: foundEvent.seasonId,
                eventId: foundEvent._id,
              }));
            } else {
              console.warn(`EventId "${targetEventId}" not found.`);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching seasons/events:", err);
        if (isMounted) {
          setError("Failed to load season/event data.");
        }
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [initialEventId, formData.eventId]);

  if (user?.role !== "superAdmin" && user?.role !== "eventAdmin") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Permission Denied.</Typography>
      </Box>
    );
  }

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    event: SelectChangeEvent<string>,
    child: React.ReactNode
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "seasonId") {
        newState.eventId = "";
      }
      return newState;
    });
  };

  const handleSkillsChange = (
    _event: React.SyntheticEvent,
    newValue: string[]
  ) => {
    setFormData((prev) => ({ ...prev, skills: newValue }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    setError("");
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Valid email is required");
      return false;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Enter 10 digits for phone (if provided)");
      return false;
    }
    if (!formData.skills.length) {
      setError("At least one skill is required");
      return false;
    }
    if (!formData.eventId) {
      setError("Event selection is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess("");
    if (!validateForm()) return;
    setLoading(true);
    const playerData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone || null,
      skills: formData.skills,
      isIcon: formData.isIcon,
      eventId: formData.eventId,
    };
    try {
      if (searchParams.get("edit")) {
        await playersService.updatePlayer({
          playerId: searchParams.get("edit") as string,
          ...playerData,
        });
        setSuccess("Player updated successfully");
      } else {
        await playersService.createPlayer(playerData);
        setSuccess("Player created successfully");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          skills: [],
          isIcon: false,
          eventId: "",
          seasonId: "",
        });
      }
      setTimeout(() => {
        router.push("/dashboard/players");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error saving player:", err);
      setError(err instanceof Error ? err.message : "Failed to save player.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/players");
  };

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    path: string
  ) => {
    event.preventDefault();
    router.push(path);
  };

  // Filter events by the selected season.
  const filteredEvents = formData.seasonId
    ? events.filter((ev) => ev?._id && ev.seasonId === formData.seasonId)
    : [];

  // If the current eventId isn’t among the filtered events, force value to an empty string.
  const currentEventValue =
    formData.eventId &&
    filteredEvents.some((evt) => evt._id === formData.eventId)
      ? formData.eventId
      : "";

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard/players"
            onClick={(e) => handleLinkClick(e, "/dashboard/players")}
          >
            Players
          </Link>
          <Typography color="text.primary">
            {searchParams.get("edit") ? "Edit Player" : "Add Player"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          {searchParams.get("edit") ? "Edit Player" : "Add New Player"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <TextField
                required
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleTextChange}
                error={error.includes("First name")}
                disabled={loading}
              />
              <TextField
                required
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleTextChange}
                error={error.includes("Last name")}
                disabled={loading}
              />
            </Box>
            <TextField
              required
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              error={error.includes("email")}
              disabled={loading}
            />
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={handleTextChange}
              error={error.includes("phone")}
              helperText={
                error.includes("phone")
                  ? "Invalid (10 digits required)"
                  : "Optional, 10 digits"
              }
              disabled={loading}
            />

            {/* Skills Autocomplete field is now prepopulated with initialSkills */}
            <FormControl fullWidth error={error.includes("skill")}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.skills}
                onChange={handleSkillsChange}
                disabled={loading}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={`${option}-${index}`}
                      sx={{
                        bgcolor: "silver",
                        color: "#333",
                        m: 0.5,
                        "& .MuiChip-deleteIcon": {
                          color: "#555",
                          "&:hover": { color: "#222" },
                        },
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Skills"
                    placeholder="Type skill & press Enter"
                    error={error.includes("skill")}
                  />
                )}
              />
              <FormHelperText error={error.includes("skill")}>
                {error.includes("skill")
                  ? "At least one skill required"
                  : "Type skill & press Enter. Click 'X' to remove."}
              </FormHelperText>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isIcon}
                  onChange={handleSwitchChange}
                  name="isIcon"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Icon Player (Featured)"
              sx={{ justifyContent: "flex-start" }}
            />

            <FormControl
              fullWidth
              required
              error={!formData.seasonId && error.includes("event")}
            >
              <InputLabel id="season-label">Season *</InputLabel>
              <Select
                labelId="season-label"
                id="seasonId"
                name="seasonId"
                value={formData.seasonId}
                label="Season *"
                onChange={handleSelectChange}
                disabled={loading}
              >
                <MenuItem value="" disabled>
                  <em>Select a Season</em>
                </MenuItem>
                {seasons.map((season) => (
                  <MenuItem key={season._id} value={season._id}>
                    {season.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required error={error.includes("event")}>
              <InputLabel id="event-label">Event *</InputLabel>
              <Select
                labelId="event-label"
                id="eventId"
                name="eventId"
                value={currentEventValue}
                label="Event *"
                onChange={handleSelectChange}
                disabled={
                  loading || !formData.seasonId || filteredEvents.length === 0
                }
              >
                <MenuItem value="" disabled>
                  <em>
                    {formData.seasonId
                      ? "Select an Event"
                      : "Select Season first"}
                  </em>
                </MenuItem>
                {filteredEvents.map((evt) => (
                  <MenuItem key={evt._id} value={evt._id}>
                    {evt.name}
                  </MenuItem>
                ))}
                {formData.seasonId && filteredEvents.length === 0 && (
                  <MenuItem value="" disabled>
                    <em>No events for this season</em>
                  </MenuItem>
                )}
              </Select>
              <FormHelperText error={error.includes("event")}>
                {error.includes("event")
                  ? "Event required"
                  : !formData.seasonId
                  ? "Select season first"
                  : ""}
              </FormHelperText>
            </FormControl>

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
                disabled={loading}
                sx={{ minWidth: "100px" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: "120px" }}
              >
                {loading
                  ? searchParams.get("edit")
                    ? "Updating..."
                    : "Creating..."
                  : searchParams.get("edit")
                  ? "Update Player"
                  : "Add Player"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
