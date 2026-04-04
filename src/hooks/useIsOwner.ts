import { useAuth } from "@/contexts/AuthContext";

const OWNER_EMAIL = "jane7valentina@gmail.com";

export const useIsOwner = () => {
  const { user } = useAuth();
  return user?.email === OWNER_EMAIL;
};
