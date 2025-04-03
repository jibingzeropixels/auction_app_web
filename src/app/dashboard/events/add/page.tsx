"use client";

import { useState, useEffect, useMemo } from "react"; // Added useMemo
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
  Chip,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  // OutlinedInput, // <-- Not used, can be removed if desired
  FormHelperText,
  Autocomplete,
  SelectChangeEvent, // <--- Added import
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import React from "react"; // Import React for ReactNode type if needed

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  seasonId: string;
  skills: string[];
}

interface Season {
  _id: string;
  name: string;
}

const MAX_DESCRIPTION_LENGTH = 500;

export default function AddEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Memoize derived search parameters ---
  const memoizedSearchParams = useMemo(() => {
    const skillsString = searchParams.get("skills") || "[]";
    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse(skillsString);
    } catch (error) {
      console.error("Failed to parse skills from URL", error);
      // Keep parsedSkills as [] on error
    }
    return {
      editEventId: searchParams.get("edit"),
      prepopulatedName: searchParams.get("name") || "",
      prepopulatedDesc: searchParams.get("desc") || "",
      prepopulatedStartDate: (searchParams.get("startDate") || "").slice(0, 10),
      prepopulatedEndDate: (searchParams.get("endDate") || "").slice(0, 10),
      prepopulatedSeasonId: searchParams.get("seasonId") || "",
      prepopulatedSkills: parsedSkills, // Use the stable parsed array reference
    };
  }, [searchParams]); // Re-run only if searchParams object reference changes

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
    skills: [],
  });

  const [descriptionLength, setDescriptionLength] = useState<number>(0);

  // --- Fetch seasons on mount ---
  useEffect(() => {
    async function fetchSeasons() {
      try {
        const seasonsData = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);
      } catch (err) {
        console.error("Error fetching seasons:", err);
        setError("Failed to load seasons. Please refresh the page."); // Inform user
      }
    }
    fetchSeasons();
  }, []); // Empty dependency array: runs only once on mount

  // --- Pre-populate form in edit mode ---
  useEffect(() => {
    // Destructure from the memoized object
    const {
      editEventId,
      prepopulatedName,
      prepopulatedDesc,
      prepopulatedStartDate,
      prepopulatedEndDate,
      prepopulatedSeasonId,
      prepopulatedSkills,
    } = memoizedSearchParams;

    if (editEventId) {
      // Set form data using pre-populated values
      // The conditional value logic in the Select component handles initial mismatches
      setFormData({
        // Use direct set instead of callback if not relying on previous state here
        name: prepopulatedName,
        description: prepopulatedDesc,
        startDate: prepopulatedStartDate,
        endDate: prepopulatedEndDate,
        seasonId: prepopulatedSeasonId, // Set the ID, Select component will validate later
        skills: prepopulatedSkills,
      });
      setDescriptionLength(prepopulatedDesc.length);
    }
    // Note: If navigating *away* from edit mode back to 'add' mode on the same page instance,
    // you might need an 'else' block here to reset the form.
    // else {
    //   setFormData({ name: "", description: "", startDate: "", endDate: "", seasonId: "", skills: [] });
    //   setDescriptionLength(0);
    // }
  }, [memoizedSearchParams]); // Depend ONLY on the memoized object

  // --- Effect to validate seasonId after seasons load --- (Recommended for robustness)
  useEffect(() => {
    // If we are in edit mode, have a seasonId, seasons are loaded, but the ID is invalid -> reset it.
    if (
      memoizedSearchParams.editEventId &&
      formData.seasonId &&
      seasons.length > 0 &&
      !seasons.some((s) => s._id === formData.seasonId)
    ) {
      console.warn(
        `Pre-populated seasonId "${formData.seasonId}" not found in loaded seasons. Resetting selection.`
      );
      // Reset only the seasonId to avoid potential race conditions with other fields
      setFormData((prev) => ({ ...prev, seasonId: "" }));
    }
  }, [formData.seasonId, seasons, memoizedSearchParams.editEventId]); // Run if these change

  // --- Check authorization ---
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

  // --- Handlers ---

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

  // For select dropdowns with single selection. (Corrected Type)
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (!name) return; // Should have name from Select component

    setFormData((prev) => ({
      ...prev,
      [name]: value, // value is already string due to SelectChangeEvent<string>
    }));
  };

  // For the Autocomplete component (freeSolo, multiple).
  const handleSkillsChange = (
    _event: React.SyntheticEvent,
    newValue: string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      skills: newValue,
    }));
  };

  // Form Validation
  const validateForm = (): boolean => {
    setError(""); // Clear previous errors
    if (!formData.name.trim()) {
      setError("Event name is required");
      return false;
    }
    if (!formData.seasonId) {
      // This check ensures a season is selected before submission
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
      setError("End date must be on or after the start date");
      return false;
    }
    // Add skills validation if needed (e.g., at least one skill)
    // if (formData.skills.length === 0) {
    //   setError("At least one skill is required");
    //   return false;
    // }
    return true;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(""); // Clear previous success message

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setLoading(true);

    try {
      const eventData = {
        name: formData.name,
        desc: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        skills: formData.skills,
      };

      if (memoizedSearchParams.editEventId) {
        await eventsService.updateEvent({
          eventId: memoizedSearchParams.editEventId,
          ...eventData,
        });
        setSuccess("Event updated successfully");
      } else {
        await eventsService.createEvent({
          seasonId: formData.seasonId,
          createdBy: user?.id || "", // Ensure createdBy is handled appropriately
          ...eventData,
        });
        setSuccess("Event created successfully");
        // Reset form only on successful creation
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          seasonId: "",
          skills: [],
        });
        setDescriptionLength(0);
      }
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/events");
      }, 1500); // Slightly shorter delay maybe?
    } catch (err: unknown) {
      console.error("Error saving event:", err);
      // Provide more specific error messages if possible from the error object
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save event. Please check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel Action
  const handleCancel = () => {
    router.push("/dashboard/events");
  };

  // Breadcrumb Link Click
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    router.push(path);
  };

  // --- JSX Rendering ---
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      {" "}
      {/* Added margin top/bottom */}
      <Box sx={{ mb: 3 }}>
        {" "}
        {/* Adjusted margin */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover" // Added underline on hover
            color="inherit"
            href="/dashboard/events"
            onClick={(e) => handleLinkClick(e, "/dashboard/events")}
          >
            Events
          </Link>
          <Typography color="text.primary">
            {memoizedSearchParams.editEventId ? "Edit Event" : "Add Event"}
          </Typography>
        </Breadcrumbs>
      </Box>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        {" "}
        {/* Responsive padding */}
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          {memoizedSearchParams.editEventId ? "Edit Event" : "Add New Event"}
        </Typography>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {" "}
            {/* Allow closing */}
            {error}
          </Alert>
        )}
        {/* Success Alert */}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSuccess("")}
          >
            {" "}
            {/* Allow closing */}
            {success}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {" "}
          {/* Added noValidate */}
          <Stack spacing={3}>
            {/* Event Name */}
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Event Name"
              value={formData.name}
              onChange={handleTextChange}
              error={error.includes("name")} // Simplified error check
              helperText={
                error.includes("name") ? "Event name is required" : ""
              }
              disabled={loading}
            />

            {/* Season Select */}
            <FormControl fullWidth required error={error.includes("Season")}>
              <InputLabel id="season-label">Season</InputLabel>
              <Select
                labelId="season-label"
                id="seasonId"
                name="seasonId"
                // --- Conditional Value Logic ---
                value={
                  seasons.length === 0 ||
                  !seasons.some((s) => s._id === formData.seasonId)
                    ? "" // Use "" if seasons empty or current ID not found/valid
                    : formData.seasonId
                }
                label="Season"
                onChange={handleSelectChange}
                disabled={loading || memoizedSearchParams.editEventId !== null} // Disable if loading or editing (assuming season doesn't change on edit)
              >
                <MenuItem value="" disabled>
                  {" "}
                  {/* Make placeholder disabled */}
                  <em>Select a Season</em>
                </MenuItem>
                {seasons.map((season) => (
                  <MenuItem key={season._id} value={season._id}>
                    {season.name}
                  </MenuItem>
                ))}
              </Select>
              {/* More specific helper text for season */}
              <FormHelperText error={error.includes("Season")}>
                {error.includes("Season")
                  ? "Selecting a season is required"
                  : ""}
              </FormHelperText>
            </FormControl>

            {/* Description */}
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description (Optional)" // Clarify optionality if applicable
              multiline
              rows={4}
              value={formData.description}
              onChange={handleTextChange}
              inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
              helperText={`${descriptionLength}/${MAX_DESCRIPTION_LENGTH}`}
              disabled={loading}
            />

            {/* Skills Autocomplete */}
            <FormControl fullWidth error={error.includes("skill")}>
              <Autocomplete
                multiple
                freeSolo
                options={[]} // No predefined options needed for freeSolo
                value={formData.skills}
                onChange={handleSkillsChange}
                disabled={loading}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      // variant="outlined" // Removed variant, default looks better with bgcolor
                      label={option}
                      {...getTagProps({ index })}
                      key={`${option}-${index}`} // Use index for more robust key if options can duplicate
                      // --- Silver Background Style ---
                      sx={{
                        bgcolor: "silver",
                        color: "#333", // Darker grey for better contrast than pure black
                        m: 0.5,
                        "& .MuiChip-deleteIcon": {
                          // Style delete icon too
                          color: "#555",
                          "&:hover": {
                            color: "#222",
                          },
                        },
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Skills (Optional)" // Clarify optionality
                    placeholder="Type a skill and press Enter"
                    // No 'required' here unless the input *must* be typed into before adding tags
                    error={error.includes("skill")} // Reflect general skill errors if any
                  />
                )}
              />
              <FormHelperText>
                Type skill(s) and press Enter. Click 'X' to remove.
              </FormHelperText>
            </FormControl>

            {/* Start Date */}
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
              error={
                error.includes("start date") ||
                error.includes("End date must be")
              }
              helperText={
                error.includes("start date")
                  ? "Start date is required"
                  : error.includes("End date must be")
                  ? "End date must be on or after start date"
                  : ""
              }
              disabled={loading}
            />

            {/* End Date */}
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
              error={
                error.includes("end date") || error.includes("End date must be")
              }
              helperText={
                error.includes("end date")
                  ? "End date is required"
                  : error.includes("End date must be")
                  ? "End date must be on or after start date"
                  : ""
              }
              disabled={loading}
            />

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
                disabled={loading} // Disable cancel while submitting
                sx={{ minWidth: "100px" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: "120px" }} // Slightly wider for longer text
              >
                {loading
                  ? memoizedSearchParams.editEventId
                    ? "Updating..."
                    : "Creating..."
                  : memoizedSearchParams.editEventId
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
