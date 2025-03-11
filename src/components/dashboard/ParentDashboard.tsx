import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Search, ChevronRight } from "lucide-react";
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

// Mock data for registrations
const registrations = [
  {
    id: "1",
    eventTitle: "Summer Art Camp",
    childName: "Emma Johnson",
    date: "July 15-19, 2023",
    time: "9:00 AM - 12:00 PM",
    location: "Community Arts Center",
    status: "upcoming",
  },
  {
    id: "2",
    eventTitle: "Junior Soccer League",
    childName: "Noah Johnson",
    date: "Every Saturday",
    time: "10:00 AM - 11:30 AM",
    location: "City Sports Park",
    status: "upcoming",
  },
  {
    id: "3",
    eventTitle: "Music & Movement",
    childName: "Emma Johnson",
    date: "Tuesdays & Thursdays",
    time: "10:00 AM - 11:00 AM",
    location: "Harmony Music Studio",
    status: "active",
  },
  {
    id: "4",
    eventTitle: "Coding for Kids",
    childName: "Noah Johnson",
    date: "June 5-26, 2023",
    time: "4:00 PM - 5:30 PM",
    location: "Tech Learning Center",
    status: "completed",
  },
];

// Mock data for saved events
const savedEvents = [
  {
    id: "1",
    title: "Ballet for Beginners",
    date: "Mondays & Wednesdays",
    time: "3:30 PM - 4:30 PM",
    location: "Grace Dance Academy",
    ageGroup: "4-7 years",
    category: "Arts & Crafts",
  },
  {
    id: "2",
    title: "Science Adventure Camp",
    date: "August 7-11, 2023",
    time: "9:00 AM - 3:00 PM",
    location: "Discovery Science Center",
    ageGroup: "8-12 years",
    category: "Education",
  },
];

const ParentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("registrations");

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter(
    (registration) =>
      registration.eventTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      registration.childName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter saved events based on search query
  const filteredSavedEvents = savedEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()),
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
                Manage your children's activities
              </p>
            </div>
            <Button asChild>
              <Link to="/events">
                <Calendar className="h-4 w-4 mr-2" /> Browse Events
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome back, Sarah!</CardTitle>
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
                      registrations.filter((r) => r.status === "upcoming")
                        .length
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
                    {registrations.filter((r) => r.status === "active").length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saved Events</p>
                  <p className="text-2xl font-bold">{savedEvents.length}</p>
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

          <Tabs defaultValue="registrations" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="registrations">My Registrations</TabsTrigger>
              <TabsTrigger value="saved">Saved Events</TabsTrigger>
            </TabsList>

            <TabsContent value="registrations" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              {filteredSavedEvents.length > 0 ? (
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">
                            Event Name
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Date & Time
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Location
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Age Group
                          </th>
                          <th className="text-right py-3 px-4 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredSavedEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-muted/30">
                            <td className="py-3 px-4">
                              <div className="font-medium">{event.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {event.category}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>{event.date}</div>
                              <div className="text-sm text-muted-foreground">
                                {event.time}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {event.location}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {event.ageGroup}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/events/${event.id}`}>View</Link>
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                  <Link to={`/events/${event.id}/register`}>
                                    Register
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-2">No saved events</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't saved any events yet or your search didn't match
                    any saved events
                  </p>
                  <Button asChild>
                    <Link to="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
