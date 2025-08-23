import { createBrowserRouter } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import NewFlatsWizardRoutes from "../features/flats/components/NewFlatWizard/NewFlatsRoute";
import EditFlat from "../features/flats/pages/EditFlat";
import AppLayout from "../layouts/headerLayout";
import SearchMenuPage from "../features/search/SearchPage";
import AllFlats from "../features/flats/pages/AllFlats";
import FlatView from "../features/flats/pages/FlatView";
import Myflats from "../features/flats/pages/MyFlats";
import Favorites from "../features/flats/pages/Favorites";
import Profile from "../features/users/pages/profile";
import ProfileUpdate from "../features/users/pages/ProfilUpdate";
import RequireAuth from "../features/auth/RequiredAuth";
import AllUsers from "../features/users/pages/AllUsers";

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <SearchMenuPage /> },
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            {
                path: "profile",
                element: (
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                ),
            },
            {
                path: "profile/edit",
                element: (
                  <RequireAuth>
                    <ProfileUpdate />
                  </RequireAuth>
                ),
            },
            { path: "new-flat/*", element: <NewFlatsWizardRoutes /> },
            { path: "edit/:id", element: <EditFlat /> },
            { path: "flats", element: <AllFlats /> },
            { path: "flat/:id", element: <FlatView /> },
            { path: "favorites", element: <Favorites /> },
            { path: "my-flats", element: <Myflats /> },
            { path: "all-users", element: <AllUsers /> },
       ]
    }
])