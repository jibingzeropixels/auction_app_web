// src/services/auth-service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log('Sending request to:', API_BASE_URL);


export const authService = {
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    adminType: string;
    attributeId?: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};