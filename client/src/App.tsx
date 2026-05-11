import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import AppRoutes, { server_url } from "./AppRoutes";
import { setUser } from "./redux/slices/authSlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${server_url}/api/user/current-user`, {
          withCredentials: true,
        });
        if (response.data.success) {
          dispatch(setUser(response.data.user));
        }
      } catch (error) {
        console.log("No active session found");
      }
    };
    fetchUser();
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
    </>
  );
};

export default App;