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
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { seasonsService } from "@/services/seasons";

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export default function AddSeasonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Retrieve details from query parameters for edit mode
  const editSeasonId = searchParams.get("edit");
  // When receiving dates in ISO format, slice out only the date part (YYYY-MM-DD)
  const prepopulatedName = searchParams.get("name") || "";
  const prepopulatedDesc = searchParams.get("desc") || "";
  const prepopulatedStartDate = (searchParams.get("startDate") || "").slice(
    0,
    10
  );
  const prepopulatedEndDate = (searchParams.get("endDate") || "").slice(0, 10);

  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const MAX_DESCRIPTION_LENGTH = 500;

  // Check if super admin
  if (user?.role !== "superAdmin") {
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

  // Pre-populate form if in edit mode using query parameters.
  // Slice out only the date part for startDate and endDate.
  useEffect(() => {
    if (editSeasonId) {
      setFormData({
        name: prepopulatedName,
        description: prepopulatedDesc,
        startDate: prepopulatedStartDate,
        endDate: prepopulatedEndDate,
      });
      setDescriptionLength(prepopulatedDesc.length);
    }
  }, [
    editSeasonId,
    prepopulatedName,
    prepopulatedDesc,
    prepopulatedStartDate,
    prepopulatedEndDate,
  ]);

  const handleChange = (
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

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Season name is required");
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
      if (editSeasonId) {
        // Update season including startDate and endDate (convert to ISO strings if needed)
        await seasonsService.updateSeason({
          seasonId: editSeasonId,
          name: formData.name,
          desc: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
        setSuccess("Season updated successfully");
      } else {
        // Create new season: Convert date fields to ISO strings.
        await seasonsService.createSeason({
          name: formData.name,
          desc: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          createdBy: "67d4215234760b6857377d8c", // Hard-coded createdBy value
        });
        setSuccess("Season created successfully");
        // Clear form data on create
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
        });
        setDescriptionLength(0);
      }

      setTimeout(() => {
        router.push("/dashboard/seasons");
      }, 2000);
    } catch (err: unknown) {
      setError("Failed to save season. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/seasons");
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
            href="/dashboard/seasons"
            onClick={(e) => handleLinkClick(e, "/dashboard/seasons")}
          >
            Seasons
          </Link>
          <Typography color="text.primary">
            {editSeasonId ? "Edit Season" : "Add Season"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {editSeasonId ? "Edit Season" : "Add New Season"}
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
              label="Season Name"
              value={formData.name}
              onChange={handleChange}
              error={error.includes("name")}
              helperText={
                error.includes("name") ? "Season name is required" : ""
              }
            />

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
              helperText={`${descriptionLength}/${MAX_DESCRIPTION_LENGTH}`}
            />

            {/* Date fields are always shown */}
            <TextField
              required
              fullWidth
              id="startDate"
              name="startDate"
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
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
              onChange={handleChange}
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
                  ? editSeasonId
                    ? "Updating..."
                    : "Creating..."
                  : editSeasonId
                  ? "Update Season"
                  : "Add Season"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
