"use client";

import React, { useState, useEffect } from "react";
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
  FormHelperText,
  Switch,
  FormControlLabel,
  Grid,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import { playersService } from "@/services/players-service";
import { SelectChangeEvent } from "@mui/material/Select";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Ratings for skills: each object maps a skill name to its rating.
  skills: { skillName: string; rating: number }[];
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
  // event-skills defined by admin; may be null.
  skills: string[] | null;
}

export default function AddPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtain first/last name either individually or via the "name" parameter.
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

  // Parse "skills" from the URL if provided.
  // ... other code like initialFirstName etc. ...

  const initialSkillsParam = searchParams.get("skills");

  // >>> THIS DECLARATION MUST BE HERE <<<
  const initialSkills: { skillName: string; rating: number }[] = [];

  if (initialSkillsParam) {
    // The block using .push() starts AFTER the declaration
    try {
      const parsed: unknown = JSON.parse(initialSkillsParam);
      if (Array.isArray(parsed)) {
        parsed.forEach((skillObj: unknown) => {
          if (
            skillObj &&
            typeof skillObj === "object" &&
            !Array.isArray(skillObj)
          ) {
            Object.keys(skillObj).forEach((key) => {
              const rating = (skillObj as Record<string, unknown>)[key];
              if (typeof rating === "number" && !isNaN(rating)) {
                // >>> USAGE IS HERE, inside nested blocks <<<
                initialSkills.push({ skillName: key, rating: rating });
              } else {
                console.warn(`Invalid rating type for skill "${key}":`, rating);
              }
            });
          } else {
            console.warn("Parsed skill item is not a valid object:", skillObj);
          }
        });
      } else {
        console.warn("Parsed skills parameter is not an array:", parsed);
      }
    } catch (err) {
      console.error("Failed to parse skills parameter:", err);
    }
  }

  // ... rest of the component, like the useState for formData ...

  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Initialize state. Note: we seed the skills from the URL.
  const [formData, setFormData] = useState<FormData>({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: initialEmail,
    phone: searchParams.get("phone") || "",
    skills: initialSkills,
    isIcon: false,
    eventId: initialEventId,
    seasonId: "",
  });

  // Fetch seasons and events.
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

          // If an event is provided via URL or formData, update the season accordingly.
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

  useEffect(() => {
    if (formData.eventId && events.length > 0) {
      const selectedEvent = events.find((ev) => ev._id === formData.eventId);

      if (
        selectedEvent?.skills &&
        Array.isArray(selectedEvent.skills) &&
        selectedEvent.skills.length > 0
      ) {
        const eventSkills = selectedEvent.skills
          .map((s) => String(s || "").trim())
          .filter(Boolean);

        setFormData((prev) => {
          const mergedSkills = eventSkills.map((skillName) => {
            const existing = prev.skills.find(
              (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
            );
            return {
              skillName,
              rating: existing ? existing.rating : 0,
            };
          });

          if (JSON.stringify(prev.skills) === JSON.stringify(mergedSkills)) {
            return prev;
          } else {
            return { ...prev, skills: mergedSkills };
          }
        });
      }
    } else if (!formData.eventId && events.length > 0) {
      setFormData((prev) => {
        if (prev.skills.length === 0) return prev;
        return { ...prev, skills: [] };
      });
    }
  }, [formData.eventId, events]);

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

  // Use the SelectChangeEvent type from MUI.
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      // When season changes, reset eventId and let the effect update skills later.
      const next = { ...prev, [name]: value };
      if (name === "seasonId") {
        next.eventId = "";
        next.skills = []; // clear any previous ratings
      }
      return next;
    });
  };

  // Update a rating for a specific skill.
  const handleRatingChange = (skillName: string, rating: number) => {
    setFormData((prev) => {
      const existing = prev.skills.find((s) => s.skillName === skillName);
      let updated: typeof prev.skills;
      if (existing) {
        updated = prev.skills.map((s) =>
          s.skillName === skillName ? { ...s, rating } : s
        );
      } else {
        updated = [...prev.skills, { skillName, rating }];
      }
      return { ...prev, skills: updated };
    });
  };

  // Helper function to validate the form.
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
    // Ensure that ratings exist for each skill being rendered.
    if (renderSkills.length && formData.skills.length !== renderSkills.length) {
      setError("Please rate all skills");
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

    // Transform skills into the payload format:
    // For example: [ { batting: 3 }, { bowling: 4 } ]
    const skillsPayload = formData.skills.map((s) => ({
      [s.skillName]: s.rating,
    }));

    const playerData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone || null,
      skills: skillsPayload,
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

  // Filter events based on the selected season.
  const filteredEvents = formData.seasonId
    ? events.filter((ev) => ev?._id && ev.seasonId === formData.seasonId)
    : [];

  // Ensure that the current eventId is valid.
  const currentEventValue =
    formData.eventId &&
    filteredEvents.some((evt) => evt._id === formData.eventId)
      ? formData.eventId
      : "";

  // Determine which skills to render:
  // Prefer the selected event’s skills. If not available, use the ones in formData.
  const selectedEvent = events.find((ev) => ev._id === formData.eventId);
  const renderSkills: string[] =
    selectedEvent && selectedEvent.skills && selectedEvent.skills.length > 0
      ? selectedEvent.skills.map((s) => s.trim())
      : formData.skills.map((s) => s.skillName);

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
            {/* Name Fields */}
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

            {/* Contact Fields */}
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

            {/* Icon Switch */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isIcon}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, isIcon: e.target.checked }))
                  }
                  name="isIcon"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Icon Player (Featured)"
              sx={{ justifyContent: "flex-start" }}
            />

            {/* Season Selector */}
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

            {/* Event Selector */}
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

            {/* Skills Rating Inputs */}
            {renderSkills.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Rate Skills (1–5):
                </Typography>
                <Grid container spacing={2}>
                  {renderSkills.map((skill) => {
                    // Use the merged rating from formData.
                    const currentRating =
                      formData.skills.find(
                        (s) => s.skillName.toLowerCase() === skill.toLowerCase()
                      )?.rating || 0;
                    return (
                      <Grid item xs={12} key={skill}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography>{skill}</Typography>
                          <Rating
                            name={`rating-${skill}`}
                            value={currentRating}
                            onChange={(_, value) =>
                              handleRatingChange(skill, value || 0)
                            }
                            max={5}
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {/* Action Buttons */}
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
