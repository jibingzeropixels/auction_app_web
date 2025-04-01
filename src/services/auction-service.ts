import { ApiPlayer } from '@/types/player';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

export const auctionService = {
  getRandomPlayer: async (eventId: string): Promise<ApiPlayer> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auctions/getRandomPlayers?eventId=${eventId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch random player");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching random player:", error);
      throw error;
    }
  },

  purchasePlayer: async (purchaseData: {
    playerId: string;
    teamId: string;
    amount: number;
    eventId: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auctions/purchase`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to purchase player");
      }

      return await response.json();
    } catch (error) {
      console.error("Error purchasing player:", error);
      throw error;
    }
  }
};