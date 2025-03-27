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
  getAllApprovals: async (type: 'events' | 'teams') => {
    try {
      const apiUrl = `${API_BASE_URL}/approvals/getAllApprovals?type=${type}`;
      console.log(`Calling getAllApprovals API for ${type}:`, apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} approvals`);
      }

      const data = await response.json();
      console.log(`Success response for ${type}:`, data);
      
      if (Array.isArray(data) && data.length === 0) {
        return [];
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${type} approvals:`, error);
      throw error;
    }
  },
  
  updateAdminStatus: async (data: {
    userId: string;
    requestId: string;
    status: 'approved' | 'rejected';
  }) => {
    try {
      console.log("Would update status with:", data);
      return { success: true }; 
    } catch (error) {
      console.error("Error updating approval status:", error);
      throw error;
    }
  }
};