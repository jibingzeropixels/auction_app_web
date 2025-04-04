import { ApiPlayer } from "@/types/player";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

export interface TeamBudget {
  teamId: string;
  playersBought: number;
  remainingBudget: number;
  reserveAmount: number;
  maxAuctionAmount: number;
  teamName: string;
}

export const auctionService = {
  getRandomPlayer: async (
    eventId: string,
    options?: { skipped?: boolean; playerId?: string }
  ): Promise<ApiPlayer> => {
    try {
      let url = `${API_BASE_URL}/auctions/getRandomPlayers?eventId=${eventId}`;

      if (options?.skipped && options?.playerId) {
        url += `&skipped=true&playerId=${options.playerId}`;
      }

      const response = await fetch(url, {
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
    auctionId: string;
    teamId: string;
    playerId: string;
    soldPrice: number;
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
  },

  resetAuction: async (auctionId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auctions/resetAuction`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          auctionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset auction");
      }

      return await response.json();
    } catch (error) {
      console.error("Error resetting auction:", error);
      throw error;
    }
  },

  getTeamBudget: async (auctionId: string): Promise<TeamBudget[]> => {
    try {
      const url = `${API_BASE_URL}/auctions/teamBudget?auctionId=${auctionId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch team budgets");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching team budgets:", error);
      throw error;
    }
  },
};
