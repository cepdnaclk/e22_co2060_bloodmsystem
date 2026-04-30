import api from '../api/api'

export const getUpcomingCamps = async () => {
  const response = await api.get('donor/camps/upcoming/');
  return response.data;
};

export const registerForCamp = async (campId) => {
  const response = await api.post(`donor/camps/${campId}/register/`);
  return response.data;
};

// Organizer methods
export const getOrganizerCamps = async () => {
  const response = await api.get('donor/camps/');
  return response.data;
};

export const createBloodCamp = async (campData) => {
  const response = await api.post('donor/camps/', campData);
  return response.data;
};

export const getCampRegistrations = async (campId) => {
  const response = await api.get(`donor/camps/${campId}/registrations/`);
  return response.data;
};

export const approveCampRegistration = async (registrationId, appointmentTime) => {
  const response = await api.post(`donor/camps/registrations/${registrationId}/approve/`, {
    appointment_time: appointmentTime
  });
  return response.data;
};
