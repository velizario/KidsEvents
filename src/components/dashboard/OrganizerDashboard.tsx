import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Users,
  Settings,
  ChevronRight,
  Search,
  Loader,
  User,
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
import { useEvents } from "@/hooks/useEvents";
import { useAuthStore } from "@/store/authStore";
import { Event } from "@/types/models";

// Mock data for registrations
const registrations = [
  {
    id: "1",
    eventTitle: "Summer Art Camp",
    childName: "Emma Johnson",
    parentName: "Sarah Johnson",
    date: "2023-06-10",
    status: "confirmed",
  },
  {
    id: "2",
    eventTitle: "Junior Soccer League",
    childName: "Noah Williams",
    parentName: "Michael Williams",
    date: "2023-06-08",
    status: "confirmed",
  },
  {
    id: "3",
    eventTitle: "Coding for Kids",
    childName: "Olivia Davis",
    parentName: "Jennifer Davis",
    date: "2023-06-07",
    status: "pending",
  },
  {
    id: "4",
    eventTitle: "Summer Art Camp",
    childName: "Liam Brown",
    parentName: "David Brown",
    date: "2023-06-05",
    status: "confirmed",
  },
  {
    id: "5",
    eventTitle: "Music & Movement",
    childName: "Sophia Miller",
    parentName: "Jessica Miller",
    date: "2023-06-02",
    status: "confirmed",
  },
];

const OrganizerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<Event[]>([]);
  const {
    events: fetchedEvents,
    loading,
    error,
    fetchEventsByOrganizer,
  } = useEvents();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadOrganizerEvents = async () => {
      if (user?.id) {
        try {
          await fetchEventsByOrganizer(user.id);
        } catch (err) {
          console.error("Error fetching organizer events:", err);
        }
      }
    };

    loadOrganizerEvents();
  }, [user?.id]); // Only depend on user ID, not the function reference

  // Set events when fetchedEvents changes
  useEffect(() => {
    if (fetchedEvents) {
      setEvents(fetchedEvents);
    }
  }, [fetchedEvents]);

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter(
    (registration) =>
      registration.childName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      registration.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your events and registrations
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/organizer/profile">
                  <User className="h-4 w-4 mr-2" /> Edit Profile
                </Link>
              </Button>
              <Button asChild>
                <Link to="/events/create">
                  <Plus className="h-4 w-4 mr-2" /> Create New Event
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{events?.length || 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">
                  {/* Calculate the sum of registrations from all fetched events */}
                  {events?.reduce(
                    (sum, event) => sum + (event.registrations || 0),
                    0
                  ) || 0}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">
                  {events?.filter((e) => e.status === "active").length || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events or registrations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="events" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12 bg-white rounded-lg border border-border">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading your events...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-2 text-destructive">
                    Error loading events
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    There was a problem fetching your events. Please try again
                    later.
                  </p>
                  <Button
                    onClick={() => user?.id && fetchEventsByOrganizer(user.id)}
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">
                            Event Name
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Location
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Registrations
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-muted/30">
                            <td className="py-3 px-4">
                              <div className="font-medium">{event.title}</div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {event.date}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {event.location}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium">
                                  {event.registrations}
                                </span>
                                <span className="text-muted-foreground">
                                  /{event.capacity}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  event.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {event.status === "active" ? "Active" : "Draft"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/events/${event.id}/manage`}>
                                  Manage{" "}
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or create a new event
                  </p>
                  <Button asChild>
                    <Link to="/events/create">
                      <Plus className="h-4 w-4 mr-2" /> Create New Event
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="registrations" className="space-y-4">
              {filteredRegistrations.length > 0 ? (
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">
                            Child Name
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Parent
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Event
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Registration Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredRegistrations.map((registration) => (
                          <tr
                            key={registration.id}
                            className="hover:bg-muted/30"
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium">
                                {registration.childName}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {registration.parentName}
                            </td>
                            <td className="py-3 px-4">
                              {registration.eventTitle}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {registration.date}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  registration.status === "confirmed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {registration.status === "confirmed"
                                  ? "Confirmed"
                                  : "Pending"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/registrations/${registration.id}`}>
                                  View <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-2">
                    No registrations found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
