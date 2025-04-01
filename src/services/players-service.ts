import { ApiPlayer } from '@/types/player';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

export const playersService = {
  getAllPlayers: async (): Promise<ApiPlayer[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/getAllPlayers`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch players");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching players:", error);
      throw error;
    }
  },

  createPlayer: async (playerData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
    skills: string[];
    eventId: string;
    isIcon: boolean;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/createPlayer`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create player");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating player:", error);
      throw error;
    }
  },

  updatePlayer: async (playerData: {
    playerId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    skills?: string[];
    eventId?: string;
    isIcon?: boolean;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/updatePlayer`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update player");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating player:", error);
      throw error;
    }
  },

  deletePlayer: async (playerId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/deletePlayer`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete player");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting player:", error);
      throw error;
    }
  },
};