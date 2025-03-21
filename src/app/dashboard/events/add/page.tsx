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

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  seasonId: string;
}

interface Season {
  _id: string;
  name: string;
}

export default function AddEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editEventId = searchParams.get("edit");
  const prepopulatedName = searchParams.get("name") || "";
  const prepopulatedDesc = searchParams.get("desc") || "";
  const prepopulatedStartDate = (searchParams.get("startDate") || "").slice(
    0,
    10
  );
  const prepopulatedEndDate = (searchParams.get("endDate") || "").slice(0, 10);
  const prepopulatedSeasonId = searchParams.get("seasonId") || "";

  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [seasons, setSeasons] = useState<Season[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    seasonId: "",
  });

  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const MAX_DESCRIPTION_LENGTH = 500;

  // Fetch seasons on mount.
  useEffect(() => {
    async function fetchSeasons() {
      try {
        const seasonsData = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);
      } catch (err) {
        console.error("Error fetching seasons:", err);
      }
    }
    fetchSeasons();
  }, []);

  // Pre-populate form in edit mode.
  useEffect(() => {
    if (editEventId) {
      setFormData({
        name: prepopulatedName,
        description: prepopulatedDesc,
        startDate: prepopulatedStartDate,
        endDate: prepopulatedEndDate,
        seasonId: prepopulatedSeasonId,
      });
      setDescriptionLength(prepopulatedDesc.length);
    }
  }, [
    editEventId,
    prepopulatedName,
    prepopulatedDesc,
    prepopulatedStartDate,
    prepopulatedEndDate,
    prepopulatedSeasonId,
  ]);

  // Check authorization.
  if (user?.role !== "superAdmin" && user?.role !== "eventAdmin") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          You don't have permission to access this page.
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

  // Handler for text fields / textareas.
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "description") {
      setDescriptionLength(value.length);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Separate handler for the Select component.
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Event name is required");
      return false;
    }
    if (!formData.seasonId) {
      setError("Season is required");
      return false;
    }
    if (!formData.startDate) {
      setError("Start date is required");
      return false;
    }
    if (!formData.endDate) {
      setError("End date is required");
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("End date must be after start date");
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
      if (editEventId) {
        await eventsService.updateEvent({
          eventId: editEventId,
          name: formData.name,
          desc: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
        setSuccess("Event updated successfully");
      } else {
        await eventsService.createEvent({
          seasonId: formData.seasonId,
          name: formData.name,
          desc: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          createdBy: user?.id,
        });
        setSuccess("Event created successfully");
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          seasonId: "",
        });
        setDescriptionLength(0);
      }
      setTimeout(() => {
        router.push("/dashboard/events");
      }, 2000);
    } catch (err: unknown) {
      setError("Failed to save event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/events");
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    router.push(path);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            color="inherit"
            href="/dashboard/events"
            onClick={(e) => handleLinkClick(e, "/dashboard/events")}
          >
            Events
          </Link>
          <Typography color="text.primary">
            {editEventId ? "Edit Event" : "Add Event"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {editEventId ? "Edit Event" : "Add New Event"}
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
              label="Event Name"
              value={formData.name}
              onChange={handleTextChange}
              error={error.includes("name")}
              helperText={
                error.includes("name") ? "Event name is required" : ""
              }
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

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleTextChange}
              inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
              helperText={`${descriptionLength}/${MAX_DESCRIPTION_LENGTH}`}
            />

            <TextField
              required
              fullWidth
              id="startDate"
              name="startDate"
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleTextChange}
              InputLabelProps={{ shrink: true }}
              error={error.includes("start date")}
              helperText={
                error.includes("start date") ? "Start date is required" : ""
              }
            />

            <TextField
              required
              fullWidth
              id="endDate"
              name="endDate"
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={handleTextChange}
              InputLabelProps={{ shrink: true }}
              error={error.includes("end date")}
              helperText={
                error.includes("end date") ? "End date is required" : ""
              }
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
                  ? editEventId
                    ? "Updating..."
                    : "Creating..."
                  : editEventId
                  ? "Update Event"
                  : "Add Event"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
