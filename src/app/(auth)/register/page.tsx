// src/app/(auth)/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import { authService } from "@/services/auth-service";

// Type definitions
interface Season {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  name: string;
  seasonId: string;
}

interface Team {
  _id: string;
  name: string;
  eventId: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "teamRepresentative" | "eventAdmin";
  seasonId: string;
  eventId: string;
  teamId: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "teamRepresentative",
    seasonId: "",
    eventId: "",
    teamId: "",
  });
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all attributes from the API on component mount.
  useEffect(() => {
    authService
      .getAllAttributes()
      .then((data) => {
        setSeasons(data.seasons);
        setAllEvents(data.events);
        setAllTeams(data.teams);
      })
      .catch(() => {
        setError("Failed to fetch attributes");
      });
  }, []);

  // Filter events based on selected season.
  useEffect(() => {
    if (!formData.seasonId) {
      setEvents([]);
      setFormData((prev) => ({ ...prev, eventId: "", teamId: "" }));
      return;
    }
    const filteredEvents = allEvents.filter(
      (event) => event.seasonId === formData.seasonId
    );
    setEvents(filteredEvents);

    if (
      formData.eventId &&
      !filteredEvents.some((e) => e._id === formData.eventId)
    ) {
      setFormData((prev) => ({ ...prev, eventId: "", teamId: "" }));
    }
  }, [formData.seasonId, formData.eventId, allEvents]);

  // Filter teams based on selected event.
  useEffect(() => {
    if (!formData.eventId) {
      setTeams([]);
      setFormData((prev) => ({ ...prev, teamId: "" }));
      return;
    }
    const filteredTeams = allTeams.filter(
      (team) => team.eventId === formData.eventId
    );
    setTeams(filteredTeams);

    if (
      formData.teamId &&
      !filteredTeams.some((t) => t._id === formData.teamId)
    ) {
      setFormData((prev) => ({ ...prev, teamId: "" }));
    }
  }, [formData.eventId, formData.teamId, allTeams]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (
      (formData.role === "eventAdmin" ||
        formData.role === "teamRepresentative") &&
      !formData.seasonId
    ) {
      setError("Please select a season");
      return false;
    }
    if (
      (formData.role === "eventAdmin" ||
        formData.role === "teamRepresentative") &&
      !formData.eventId
    ) {
      setError("Please select an event");
      return false;
    }
    if (formData.role === "teamRepresentative" && !formData.teamId) {
      setError("Please select a team");
      return false;
    }
    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Determine adminType and attributeId based on the role
      const adminType =
        formData.role === "teamRepresentative" ? "teamAdmin" : "eventAdmin";
      const attributeId =
        formData.role === "teamRepresentative"
          ? formData.teamId
          : formData.eventId;

      // Build the payload including seasonId and eventId.
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        adminType,
        attributeId: attributeId || undefined,
        eventId: formData.eventId,
        seasonId: formData.seasonId,
      };

      await authService.register(userData);

      setSuccess("Registration successful! Please wait for admin approval.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "teamRepresentative",
        seasonId: "",
        eventId: "",
        teamId: "",
      });

      // Redirect after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, width: "100%" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                autoFocus
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                >
                  <MenuItem value="teamRepresentative">
                    Team Representative
                  </MenuItem>
                  <MenuItem value="eventAdmin">Event Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(formData.role === "eventAdmin" ||
              formData.role === "teamRepresentative") && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="season-label">Season</InputLabel>
                  <Select
                    labelId="season-label"
                    id="seasonId"
                    name="seasonId"
                    value={formData.seasonId}
                    label="Season"
                    onChange={handleChange}
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
                </FormControl>
              </Grid>
            )}

            {formData.seasonId && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="event-label">Event</InputLabel>
                  <Select
                    labelId="event-label"
                    id="eventId"
                    name="eventId"
                    value={formData.eventId}
                    label="Event"
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Select an Event</em>
                    </MenuItem>
                    {events.map((event) => (
                      <MenuItem key={event._id} value={event._id}>
                        {event.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.role === "teamRepresentative" && formData.eventId && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="team-label">Team</InputLabel>
                  <Select
                    labelId="team-label"
                    id="teamId"
                    name="teamId"
                    value={formData.teamId}
                    label="Team"
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Select a Team</em>
                    </MenuItem>
                    {teams.map((team) => (
                      <MenuItem key={team._id} value={team._id}>
                        {team.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Register"}
          </Button>

          <Box textAlign="center">
            <Link href="/login">
              <Typography variant="body2" color="primary">
                Already have an account? Sign in
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
