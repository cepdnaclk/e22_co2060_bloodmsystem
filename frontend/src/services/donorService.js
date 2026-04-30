import api from "../api/api";

/**
 * Fetches the donor's full profile.
 * Maps backend field names to the names expected by the UI.
 */
export const getDonorProfile = async () => {
  try {
    const response = await api.get("donor/profile/");
    const data = response.data;
    
    // Transform backend data to match frontend expectations
    return {
      ...data,
      donations: data.total_donations,
      last_donation: data.last_donation_date,
      events: data.total_events,
      // Ensure profile image has a fallback or correct path
      profile_image: data.profile_image || "https://i.pravatar.cc/150?img=11"
    };
  } catch (error) {
    console.error("Error fetching donor profile:", error);
    throw error; // Let the component handle the error
  }
};

/**
 * Updates the donor's profile.
 */
export const updateDonorProfile = async (profileData) => {
  try {
    const formData = new FormData();
    
    if (profileData.phoneNumber) formData.append('phoneNumber', profileData.phoneNumber);
    if (profileData.hospital) formData.append('hospital', profileData.hospital);
    if (profileData.is_available !== undefined) formData.append('is_available', profileData.is_available);
    
    if (profileData.profile_image instanceof File) {
      formData.append('profile_image', profileData.profile_image);
    }

    const response = await api.put("donor/profile/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating donor profile:", error);
    throw error;
  }
};

/**
 * Fetches computed dashboard stats (eligibility, next donation date, etc.)
 */
export const getDonorDashboard = async () => {
  try {
    const response = await api.get("donor/dashboard/");
    return response.data;
  } catch (error) {
    console.error("Error fetching donor dashboard:", error);
    throw error;
  }
};
<<<<<<< HEAD
=======

/**
 * Fetches paginated donation history for the logged-in donor.
 * @param {Object} params - { status, year, page, page_size }
 */
export const getDonorDonations = async (params = {}) => {
  try {
    const response = await api.get("donor/donations/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching donation history:", error);
    throw error;
  }
};
>>>>>>> 33d958e (enhanced donircamphistory model and add alrt feature)
