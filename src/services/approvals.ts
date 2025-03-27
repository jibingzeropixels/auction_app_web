// src/services/approvals.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

export const approvalsService = {
  // Get all approvals
  getAllApprovals: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/approvals/getAllApprovals`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch approvals");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching approvals:", error);
      throw error;
    }
  },

  // Update admin status (approve/reject)
  updateAdminStatus: async (data: {
    userId: string;
    status: 'approved' | 'rejected';
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/approvals/adminStatusUpdate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update approval status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating approval status:", error);
      throw error;
    }
  }
};