import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Search,
  ChevronRight,
  Loader2,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParentData } from "@/hooks/useParentData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ParentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { loading, error, children, registrations, parent } = useParentData();

  // Transform registrations data to match the UI format
  const formattedRegistrations = registrations.map((registration) => {
    const event = registration.events;
    const child = registration.children;

    // Determine if the event is in the future, current, or past
    const eventDate = event?.date ? new Date(event.date) : null;
    const today = new Date();

    // Add one day to account for events happening today
    today.setHours(0, 0, 0, 0);

    let eventStatus = "upcoming";
    if (registration.status === "cancelled") {
      eventStatus = "completed";
    } else if (eventDate) {
      if (eventDate < today) {
        eventStatus = "completed";
      } else if (eventDate.toDateString() === today.toDateString()) {
        eventStatus = "active";
      } else {
        eventStatus = "upcoming";
      }
    }

    return {
      id: registration.id,
      eventTitle: event?.title || "Unknown Event",
      childName: child
        ? `${child.firstName} ${child.lastName}`
        : "Unknown Child",
      date: event?.date || "TBD",
      time: event?.time || "TBD",
      location: event?.location || "TBD",
      status: eventStatus,
      eventId: event?.id,
    };
  });

  // Filter registrations based on search query
  const filteredRegistrations = formattedRegistrations.filter(
    (registration) =>
      registration.eventTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      registration.childName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Parent Dashboard</h1>
              <p className="text-muted-foreground">
                {parent?.firstName} {parent?.lastName} • Manage your children's
                activities
              </p>
              {parent?.phone && (
                <p className="text-muted-foreground flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" />{" "}
                  {parent.phone || "Not provided"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/parent/profile">
                  <User className="h-4 w-4 mr-2" /> Edit Profile
                </Link>
              </Button>
              <Button asChild>
                <Link to="/events">
                  <Calendar className="h-4 w-4 mr-2" /> Browse Events
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading your dashboard...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message ||
                "Failed to load dashboard data. Please try again later."}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Welcome Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  Welcome back, {parent?.firstName || "Parent"}!
                </CardTitle>
                <CardDescription>
                  Here's what's happening with your children's activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Upcoming Events
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          formattedRegistrations.filter(
                            (r) => r.status === "upcoming",
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Enrollments
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          formattedRegistrations.filter(
                            (r) => r.status === "active",
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Tabs */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search registrations or saved events..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">My Registrations</h2>

                <div className="space-y-4">
                  {filteredRegistrations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredRegistrations.map((registration) => (
                        <Card key={registration.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {registration.eventTitle}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    For {registration.childName}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    registration.status === "upcoming"
                                      ? "default"
                                      : registration.status === "active"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {registration.status === "upcoming"
                                    ? "Upcoming"
                                    : registration.status === "active"
                                      ? "Active"
                                      : "Completed"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Date
                                  </p>
                                  <p>{registration.date}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Time
                                  </p>
                                  <p>{registration.time}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Location
                                  </p>
                                  <p>{registration.location}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted p-6 flex flex-col justify-center items-center md:w-48">
                              <Button
                                variant="outline"
                                className="w-full mb-2"
                                asChild
                              >
                                <Link to={`/registrations/${registration.id}`}>
                                  View Details
                                </Link>
                              </Button>
                              {registration.status !== "completed" && (
                                <div className="flex flex-col gap-2 w-full">
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                  >
                                    <Link
                                      to={`/events/${registration.eventId}`}
                                    >
                                      View Event
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="w-full text-destructive"
                                    asChild
                                  >
                                    <Link
                                      to={`/registrations/${registration.id}/cancel`}
                                    >
                                      Cancel
                                    </Link>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-border">
                      <h3 className="text-lg font-medium mb-2">
                        No registrations found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't registered for any events yet or your search
                        didn't match any registrations
                      </p>
                      <Button asChild>
                        <Link to="/events">Browse Events</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
