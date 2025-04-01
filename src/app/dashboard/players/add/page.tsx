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
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  FormHelperText,
  Switch,
  FormControlLabel,
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
  basePrice: string;
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

const SKILLS = [
  'Football',
  'Cricket',
  'Badminton',
  'Table-Tennis',
  'Swimming',
  'Dancing',
  'Singing',
  'Foosball',
  'Carroms',
  'Chess',
];

export default function AddPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPlayerId = searchParams.get("edit");
  
  const playerName = searchParams.get("name") || "";
  const nameParts = playerName.split(" ");
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";
  
  const initialCategory = searchParams.get("category") || "";
  const initialEventId = searchParams.get("eventId") || "";
  const initialBasePrice = searchParams.get("basePrice") || "100000";
  
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [formData, setFormData] = useState<FormData>({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: "",
    phone: "",
    skills: initialCategory ? [initialCategory] : [],
    basePrice: initialBasePrice,
    isIcon: false,
    eventId: initialEventId,
    seasonId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const seasonsData = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);
        const eventsData = await eventsService.getAllEvents();
        setEvents(eventsData);
        
        if (initialEventId) {
          const event = eventsData.find((event: Event) => event._id === initialEventId);
          if (event) {
            setFormData(prev => ({
              ...prev,
              seasonId: event.seasonId
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, [initialEventId]);

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

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // For select dropdowns with single selection (string value)
  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // For multi-select (skills array)
  const handleSkillsChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      skills: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  // For switch/checkbox
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    
    if (!formData.skills.length) {
      setError("Please select at least one skill");
      return false;
    }
    
    if (!formData.basePrice || isNaN(Number(formData.basePrice)) || Number(formData.basePrice) <= 0) {
      setError("Please enter a valid base price");
      return false;
    }
    
    if (!formData.eventId) {
      setError("Please select an event");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editPlayerId) {
        await playersService.updatePlayer({
          playerId: editPlayerId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || null,
          skills: formData.skills,
          basePrice: parseInt(formData.basePrice),
          isIcon: formData.isIcon,
          eventId: formData.eventId,
        });
        setSuccess("Player updated successfully");
      } else {
        await playersService.createPlayer({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || null,
          skills: formData.skills,
          basePrice: parseInt(formData.basePrice),
          isIcon: formData.isIcon,
          eventId: formData.eventId,
        });
        setSuccess("Player created successfully");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          skills: [],
          basePrice: "100000",
          isIcon: false,
          eventId: "",
          seasonId: "",
        });
      }
      
      setTimeout(() => {
        router.push("/dashboard/players");
      }, 2000);
    } catch (err: unknown) {
      console.error("Error:", err);
      setError("Failed to save player. Please try again.");
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

  const filteredEvents = formData.seasonId
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
            href="/dashboard/players"
            onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleLinkClick(event, "/dashboard/players")}
          >
            Players
          </Link>
          <Typography color="text.primary">
            {editPlayerId ? "Edit Player" : "Add Player"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {editPlayerId ? "Edit Player" : "Add New Player"}
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleTextChange}
                error={error.includes("First name")}
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
              />
            </Box>

            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              error={error.includes("email")}
              helperText="Optional"
            />

            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleTextChange}
              error={error.includes("phone")}
              helperText="Optional, 10 digits"
            />

            <FormControl fullWidth required error={error.includes("skill")}>
              <InputLabel id="skills-label">Skills</InputLabel>
              <Select
                labelId="skills-label"
                id="skills"
                name="skills"
                multiple
                value={formData.skills}
                onChange={handleSkillsChange}
                input={<OutlinedInput id="select-multiple-skills" label="Skills" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {SKILLS.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select one or more skills</FormHelperText>
            </FormControl>

            <TextField
              required
              fullWidth
              id="basePrice"
              name="basePrice"
              label="Base Price (₹)"
              type="number"
              value={formData.basePrice}
              onChange={handleTextChange}
              error={error.includes("base price")}
              InputProps={{ inputProps: { min: 0, step: 10000 } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isIcon}
                  onChange={handleSwitchChange}
                  name="isIcon"
                  color="primary"
                />
              }
              label="Icon Player (Featured)"
            />

            <FormControl fullWidth required>
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
            </FormControl>

            <FormControl fullWidth required error={error.includes("event")}>
              <InputLabel id="event-label">Event</InputLabel>
              <Select
                labelId="event-label"
                id="eventId"
                name="eventId"
                value={formData.eventId}
                label="Event"
                onChange={handleSelectChange}
                disabled={!formData.seasonId}
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
              {!formData.seasonId && (
                <FormHelperText>Please select a season first</FormHelperText>
              )}
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
                  ? editPlayerId
                    ? "Updating..."
                    : "Creating..."
                  : editPlayerId
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