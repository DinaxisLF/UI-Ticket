import { createBrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Menu from "./pages/Menu.jsx";
import Login from "./pages/Login.jsx";
import Museum from "./pages/Museum.jsx";
import SubMenu from "./components/SubMenu.jsx";

import CinemaDescription from "./pages/CinemaDescription.jsx";
import CinemaScreenings from "./pages/CinemaScreenings.jsx";

import TheatherDescription from "./pages/TheatherDescription.jsx";
import TheaterTickets from "./pages/TheatherTickets.jsx";

import PurchaseSummary from "./pages/PurchaseSummary.jsx";
import ConfirmPurchase from "./pages/ConfirmPurchase.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // Import the protector

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "login", element: <Login /> },

      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "menu",
        element: (
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        ),
      },

      {
        path: "submenu",
        element: (
          <ProtectedRoute>
            <SubMenu />
          </ProtectedRoute>
        ),
      },

      {
        path: "museum",
        element: (
          <ProtectedRoute>
            <Museum />
          </ProtectedRoute>
        ),
      },

      {
        path: "theaterEvents/:theaterId",
        element: (
          <ProtectedRoute>
            <TheatherDescription />
          </ProtectedRoute>
        ),
      },

      {
        path: "cinemaTypes/:cinemaId",
        element: (
          <ProtectedRoute>
            <CinemaDescription />
          </ProtectedRoute>
        ),
      },

      {
        path: "cinemaEvents/:id/:type",
        element: (
          <ProtectedRoute>
            <CinemaScreenings />
          </ProtectedRoute>
        ),
      },

      {
        path: "buyTheater",
        element: (
          <ProtectedRoute>
            <TheaterTickets />
          </ProtectedRoute>
        ),
      },
      {
        path: "/purchaseSummary",
        element: (
          <ProtectedRoute>
            <ConfirmPurchase />
          </ProtectedRoute>
        ),
      },
      {
        path: "/summary",
        element: (
          <ProtectedRoute>
            <PurchaseSummary />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
