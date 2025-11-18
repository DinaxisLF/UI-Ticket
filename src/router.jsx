import { createBrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Menu from "./pages/Menu.jsx";
import Login from "./pages/Login.jsx";
import SubMenu from "./components/SubMenu.jsx";

import Profile from "./pages/Profile.jsx";

import CinemaDescription from "./pages/CinemaDescription.jsx";
import CinemaScreenings from "./pages/CinemaScreenings.jsx";
import CinemaTickets from "./pages/CinemaTickets.jsx";

import TheatherDescription from "./pages/TheatherDescription.jsx";
import TheaterTickets from "./pages/TheatherTickets.jsx";

import MuseumTickets from "./pages/MuseumTickets.jsx";

import PurchaseSummary from "./pages/PurchaseSummary.jsx";
import ConfirmPurchase from "./pages/ConfirmPurchase.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
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
        path: "museumEvents/:museumId",
        element: (
          <ProtectedRoute>
            <MuseumTickets />
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
        path: "buyCinema",
        element: (
          <ProtectedRoute>
            <CinemaTickets />
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
