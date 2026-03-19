import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Loader } from "../components/reusable/Loader";

export const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, loaded } = useAuthContext();

  useEffect(() => {
    if (location.pathname === "/" && userData) navigate("/dashboard");
    if (!userData) {
      const path = location.pathname;
      const is_redirect =
        path.startsWith("/dashboard") || path.startsWith("/profile");
      if (is_redirect) navigate("/");
    }
  }, [location.pathname, navigate, userData]);

  return (
    <>
      <Header />
      {loaded ? <Outlet /> : <Loader />}
      <Footer />
    </>
  );
};
