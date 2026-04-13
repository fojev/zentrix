export const BASE_URL = import.meta.env.VITE_API_URL;

export const getUserId = () => {
  let userId = localStorage.getItem('zentrix_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('zentrix_user_id', userId);
  }
  return userId;
};
