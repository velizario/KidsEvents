import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/home";
import EventsList from "./components/events/EventsList";
import EventFiltersPage from "./components/events/EventFiltersPage";
import EventDetails from "./components/events/EventDetails";
import EventManagement from "./components/events/EventManagement";
import RegistrationForm from "./components/registration/RegistrationForm";
import RegistrationDetails from "./components/registration/RegistrationDetails";
import RegistrationConfirmation from "./components/registration/RegistrationConfirmation";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Header from "./components/layout/Header";
import OrganizerDashboard from "./components/dashboard/OrganizerDashboard";
import ParentDashboard from "./components/dashboard/ParentDashboard";
import ProfileForm from "./components/profile/ProfileForm";
import OrganizerProfile from "./components/profile/OrganizerProfile";
import ParentProfile from "./components/profile/ParentProfile";
import EventFormWrapper from "./components/events/EventFormWrapper";

// import routes from "tempo-routes"; // Uncomment if needed and adapt integration below

function App() {
  const isTempoEnabled = import.meta.env.VITE_TEMPO === "true";

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4 pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />

            <Route path="/register">
              <Route index element={<RegisterForm userType="parent" />} />
              <Route
                path="organizer"
                element={<RegisterForm userType="organizer" />}
              />
            </Route>

            <Route path="/events">
              <Route index element={<EventsList />} />
              <Route path="filters" element={<EventFiltersPage />} />
              <Route path="create" element={<EventFormWrapper />} />

              <Route path=":eventId">
                <Route index element={<EventDetails />} />
                <Route path="edit" element={<EventFormWrapper />} />
                <Route path="register" element={<RegistrationForm />} />
                <Route path="manage" element={<EventManagement />} />
                <Route
                  path="confirmation"
                  element={<RegistrationConfirmation />}
                />
              </Route>
            </Route>

            <Route
              path="/registrations/:registrationId"
              element={<RegistrationDetails />}
            />

            <Route path="/organizer">
              <Route path="dashboard" element={<OrganizerDashboard />} />
              <Route
                path="profile"
                element={<ProfileForm userType="organizer" />}
              />
              <Route path=":organizerId" element={<OrganizerProfile />} />
            </Route>

            <Route path="/parent">
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route
                path="profile"
                element={<ProfileForm userType="parent" />}
              />
              <Route path=":parentId" element={<ParentProfile />} />
            </Route>

            {isTempoEnabled && (
              <>
                {/* Integrate tempo routes here based on their structure */}
                {/* e.g., {routes.map(...)} or dedicated components */}
                <Route
                  path="/tempobook/*"
                  element={<div>Tempo Book Section</div>}
                />
              </>
            )}

            {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
          </Routes>
        </main>
      </div>
    </Suspense>
  );
}

export default App;
