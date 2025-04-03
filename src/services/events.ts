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

export const eventsService = {
  getAllEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/getAllEvents`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch events");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  createEvent: async (eventData: {
    seasonId: string;
    name: string;
    desc: string;
    startDate: string;
    endDate: string;
    skills?: string[];
    createdBy: string;
  }) => {
    try {
      console.log(eventData);
      const response = await fetch(`${API_BASE_URL}/events/createEvent`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  updateEvent: async (eventData: {
    eventId: string;
    name: string;
    desc: string;
    startDate: string;
    endDate: string;
    skills?: string[];
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/updateEvent`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update event");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  deleteEvent: async (eventId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/deleteEvent`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
