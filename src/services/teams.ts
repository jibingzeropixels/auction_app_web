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

export const teamsService = {
  getAllTeams: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/getAllTeams`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch teams");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  },

  createTeam: async (teamData: {
    name: string;
    desc: string;
    eventId: string;
    createdBy: string;
  }) => {
    try {
      console.log(teamData);
      const response = await fetch(`${API_BASE_URL}/teams/createTeam`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create team");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  },

  updateTeam: async (teamData: {
    teamId: string;
    name: string;
    desc: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/updateTeam`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update team");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating team:", error);
      throw error;
    }
  },

  deleteTeam: async (teamId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/deleteTeam`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete team");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  },
};
