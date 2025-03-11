import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Users,
  Settings,
  ChevronRight,
  Search,
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

// Mock data for events
const events = [
  {
    id: "1",
    title: "Summer Art Camp",
    date: "July 15-19, 2023",
    location: "Community Arts Center",
    registrations: 18,
    capacity: 25,
    status: "active",
  },
  {
    id: "2",
    title: "Junior Soccer League",
    date: "Every Saturday",
    location: "City Sports Park",
    registrations: 24,
    capacity: 30,
    status: "active",
  },
  {
    id: "3",
    title: "Coding for Kids",
    date: "June 5-26, 2023",
    location: "Tech Learning Center",
    registrations: 12,
    capacity: 15,
    status: "active",
  },
  {
    id: "4",
    title: "Music & Movement",
    date: "Tuesdays & Thursdays",
    location: "Harmony Music Studio",
    registrations: 8,
    capacity: 12,
    status: "active",
  },
  {
    id: "5",
    title: "Science Adventure Camp",
    date: "August 7-11, 2023",
    location: "Discovery Science Center",
    registrations: 0,
    capacity: 20,
    status: "draft",
  },
];

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

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter(
    (registration) =>
      registration.childName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      registration.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <Button asChild>
              <Link to="/events/create">
                <Plus className="h-4 w-4 mr-2" /> Create New Event
              </Link>
            </Button>
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
                <div className="text-2xl font-bold">{events.length}</div>
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
                <div className="text-2xl font-bold">{registrations.length}</div>
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
                  {events.filter((e) => e.status === "active").length}
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
              {filteredEvents.length > 0 ? (
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
                                <Link to={`/events/${event.id}`}>
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
