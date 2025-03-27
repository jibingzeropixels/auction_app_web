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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Avatar,
  IconButton
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import { teamsService } from "@/services/teams";

// skill levels
type SkillLevel = "Beginner" | "Intermediate" | "Expert" | "Pro";

interface FormData {
  name: string;
  seasonId: string;
  eventId: string;
  teamId: string;
  skillLevel: SkillLevel;
  remarks: string;
  photo: File | null;
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

interface Team {
  _id: string;
  name: string;
  eventId: string;
}

export default function AddPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPlayerId = searchParams.get("edit");
  
  const prepopulatedName = searchParams.get("name") || "";
  const prepopulatedSeasonId = searchParams.get("seasonId") || "";
  const prepopulatedEventId = searchParams.get("eventId") || "";
  const prepopulatedTeamId = searchParams.get("teamId") || "";
  const prepopulatedSkillLevel = (searchParams.get("skillLevel") as SkillLevel) || "Beginner";
  const prepopulatedRemarks = searchParams.get("remarks") || "";

  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    seasonId: "",
    eventId: "",
    teamId: "",
    skillLevel: "Beginner",
    remarks: "",
    photo: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const seasonsData = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);
        const eventsData = await eventsService.getAllEvents();
        setEvents(eventsData);
        const teamsData = await teamsService.getAllTeams();
        setTeams(teamsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (editPlayerId) {
      setFormData({
        name: prepopulatedName,
        seasonId: prepopulatedSeasonId,
        eventId: prepopulatedEventId,
        teamId: prepopulatedTeamId,
        skillLevel: prepopulatedSkillLevel,
        remarks: prepopulatedRemarks,
        photo: null
      });
      
    }
  }, [
    editPlayerId,
    prepopulatedName,
    prepopulatedSeasonId,
    prepopulatedEventId,
    prepopulatedTeamId,
    prepopulatedSkillLevel,
    prepopulatedRemarks
  ]);

  // Handler for text fields
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (name === "seasonId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        eventId: "", 
        teamId: ""   
      }));
    } else if (name === "eventId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        teamId: ""  
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, or WebP)");
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        photo: file
      }));
      
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setError("");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Player name is required");
      return false;
    }
    
    if (!formData.seasonId) {
      setError("Season is required");
      return false;
    }
    
    if (!formData.eventId) {
      setError("Event is required");
      return false;
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
      const playerData = {
        name: formData.name,
        seasonId: formData.seasonId,
        eventId: formData.eventId,
        teamId: formData.teamId || undefined,
        skillLevel: formData.skillLevel,
        remarks: formData.remarks,
      };

      if (editPlayerId) {
        console.log("Updating player:", { id: editPlayerId, ...playerData });
        
        if (formData.photo) {
          const fileData = new FormData();
          fileData.append('playerId', editPlayerId);
          fileData.append('photo', formData.photo);
          
          console.log("Uploading photo for player:", editPlayerId);
        }
        
        setSuccess("Player updated successfully");
      } else {
        console.log("Creating new player:", playerData);
        
        if (formData.photo) {
          const fileData = new FormData();
          fileData.append('photo', formData.photo);
          
          console.log("Uploading photo for new player");
        }
        
        setSuccess("Player created successfully");
        
        setFormData({
          name: "",
          seasonId: "",
          eventId: "",
          teamId: "",
          skillLevel: "Beginner",
          remarks: "",
          photo: null
        });
        setPhotoPreview(null);
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
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    router.push(path);
  };

  const filteredEvents = formData.seasonId
    ? events.filter((event) => event.seasonId === formData.seasonId)
    : [];

  const filteredTeams = formData.eventId
    ? teams.filter((team) => team.eventId === formData.eventId)
    : [];

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
            onClick={(e) => handleLinkClick(e, "/dashboard/players")}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              {photoPreview ? (
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={photoPreview} 
                    sx={{ width: 100, height: 100, mb: 1 }}
                  />
                  <IconButton
                    component="label"
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: -15, 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      },
                      width: 36,
                      height: 36
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                    />
                    <CloudUploadIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                  />
                </Button>
              )}
              <Typography variant="caption" color="text.secondary">
                Supported formats: JPG, PNG, WebP (max 2MB)
              </Typography>
            </Box>

            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Player Name"
              value={formData.name}
              onChange={handleTextChange}
              error={error.includes("name")}
              helperText={error.includes("name") ? "Player name is required" : ""}
            />

            <FormControl fullWidth required error={error.includes("Season")}>
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

            <FormControl fullWidth>
              <InputLabel id="team-label">Team (Optional)</InputLabel>
              <Select
                labelId="team-label"
                id="teamId"
                name="teamId"
                value={formData.teamId}
                label="Team (Optional)"
                onChange={handleSelectChange}
                disabled={!formData.eventId}
              >
                <MenuItem value="">
                  <em>No Team / Unassigned</em>
                </MenuItem>
                {filteredTeams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">Skill Level</FormLabel>
              <RadioGroup
                row
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleTextChange}
              >
                <FormControlLabel value="Beginner" control={<Radio />} label="Beginner" />
                <FormControlLabel value="Intermediate" control={<Radio />} label="Intermediate" />
                <FormControlLabel value="Expert" control={<Radio />} label="Expert" />
                <FormControlLabel value="Pro" control={<Radio />} label="Pro" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              id="remarks"
              name="remarks"
              label="Remarks"
              multiline
              rows={4}
              value={formData.remarks}
              onChange={handleTextChange}
              placeholder="Add any additional notes about the player"
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