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
    type: 'events' | 'teams';
  }) => {
    try {
      const apiData = {
        userId: data.userId,
        attributeId: data.requestId,
        attributeType: data.type === 'events' ? 'event' : 'team',
        approved: data.status === 'approved'
      };
      
      console.log("Calling updateAdminStatus API:", `${API_BASE_URL}/approvals/adminStatusUpdate`);
      console.log("With data:", apiData);
      
      const response = await fetch(`${API_BASE_URL}/approvals/adminStatusUpdate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });

      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to update approval status: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Success response:", responseData);
      return responseData;
    } catch (error) {
      console.error("Error updating approval status:", error);
      throw error;
    }
  }
};