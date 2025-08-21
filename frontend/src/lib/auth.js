import axiosInstance from "@/lib/axios";

const getRole = () => {
  return localStorage.getItem("userRole") || "student"; // fallback to student
};

export const getCurrentUser = async () => {
  const role = getRole();
  // ✅ backend expects /current-user, not /me
  const response = await axiosInstance.get(`/users/${role}/current-user`);
  return response.data;
};

export const logoutUser = async () => {
  const role = getRole();
  await axiosInstance.post(`/users/${role}/logout`);
};
