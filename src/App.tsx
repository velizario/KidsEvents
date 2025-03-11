import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import EventsList from "./components/events/EventsList";
import EventFiltersPage from "./components/events/EventFiltersPage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Header from "./components/layout/Header";
import OrganizerDashboard from "./components/dashboard/OrganizerDashboard";
import ParentDashboard from "./components/dashboard/ParentDashboard";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/filters" element={<EventFiltersPage />} />
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
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </main>
      </div>
    </Suspense>
  );
}

export default App;
