import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Home } from "./Layout/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Error } from "./pages/Error";
import { AuthProvider } from "./context/AuthProvider";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { AIPlanner } from "./pages/AIPlanner";
import { Tasks } from "./pages/Tasks";
import { Notes } from "./pages/Notes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/ai-planner",
        element: <AIPlanner />,
      },
      {
        path: "/tasks",
        element: <Tasks />,
      },
      {
        path: "/notes",
        element: <Notes />,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
