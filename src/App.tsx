import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import EventsList from "./components/events/EventsList";
import EventFiltersPage from "./components/events/EventFiltersPage";
import EventDetails from "./components/events/EventDetails";
import EventManagement from "./components/events/EventManagement";
import EventForm from "./components/events/EventForm";
import RegistrationForm from "./components/registration/RegistrationForm";
import RegistrationDetails from "./components/registration/RegistrationDetails";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Header from "./components/layout/Header";
import OrganizerDashboard from "./components/dashboard/OrganizerDashboard";
import ParentDashboard from "./components/dashboard/ParentDashboard";
import routes from "tempo-routes";
import EventFormWrapper from "./components/events/EventFormWrapper";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/filters" element={<EventFiltersPage />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/events/create" element={<EventFormWrapper />} />
            <Route
              path="/events/:eventId/edit"
              element={<EventFormWrapper />}
            />
            <Route
              path="/events/:eventId/register"
              element={<RegistrationForm />}
            />
            <Route
              path="/events/:eventId/manage"
              element={<EventManagement />}
            />
            <Route
              path="/registrations/:registrationId"
              element={<RegistrationDetails />}
            />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register">
              <Route index element={<RegisterForm userType="parent" />} />
              <Route
                path="organizer"
                element={<RegisterForm userType="organizer" />}
              />
            </Route>
            <Route
              path="/organizer/dashboard"
              element={<OrganizerDashboard />}
            />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" element={<div />} />
            )}
          </Routes>
        </main>
      </div>
    </Suspense>
  );
}

export default App;
