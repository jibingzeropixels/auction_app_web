// src/services/seasons.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log("Sending request to:", API_BASE_URL);

// Helper function to get Authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

export const seasonsService = {
  getAllSeasons: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/seasons/getAllSeasons`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch seasons");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching seasons:", error);
      throw error;
    }
  },

  createSeason: async (seasonData: {
    name: string;
    desc: string;
    startDate: string;
    endDate: string;
    createdBy: string;
  }) => {
    try {
      console.log(seasonData);
      const response = await fetch(`${API_BASE_URL}/seasons/createSeason`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(seasonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create season");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating season:", error);
      throw error;
    }
  },

  updateSeason: async (seasonData: {
    seasonId: string;
    name: string;
    desc: string;
    startDate: string;
    endDate: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seasons/updateSeason`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(seasonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update season");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating season:", error);
      throw error;
    }
  },

  deleteSeason: async (seasonId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seasons/deleteSeason`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ seasonId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete season");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting season:", error);
      throw error;
    }
  },
};
