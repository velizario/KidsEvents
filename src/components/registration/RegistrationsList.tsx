import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Download, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for registrations
const registrations = [
  {
    id: "1",
    eventTitle: "Summer Art Camp",
    childName: "Emma Johnson",
    parentName: "Sarah Johnson",
    parentEmail: "sarah.johnson@example.com",
    date: "July 15-19, 2023",
    registrationDate: "2023-06-10",
    status: "confirmed",
    paid: true,
  },
  {
    id: "2",
    eventTitle: "Junior Soccer League",
    childName: "Noah Williams",
    parentName: "Michael Williams",
    parentEmail: "michael.williams@example.com",
    date: "Every Saturday",
    registrationDate: "2023-06-08",
    status: "confirmed",
    paid: true,
  },
  {
    id: "3",
    eventTitle: "Coding for Kids",
    childName: "Olivia Davis",
    parentName: "Jennifer Davis",
    parentEmail: "jennifer.davis@example.com",
    date: "June 5-26, 2023",
    registrationDate: "2023-06-07",
    status: "pending",
    paid: false,
  },
  {
    id: "4",
    eventTitle: "Summer Art Camp",
    childName: "Liam Brown",
    parentName: "David Brown",
    parentEmail: "david.brown@example.com",
    date: "July 15-19, 2023",
    registrationDate: "2023-06-05",
    status: "confirmed",
    paid: true,
  },
  {
    id: "5",
    eventTitle: "Music & Movement",
    childName: "Sophia Miller",
    parentName: "Jessica Miller",
    parentEmail: "jessica.miller@example.com",
    date: "Tuesdays & Thursdays",
    registrationDate: "2023-06-02",
    status: "confirmed",
    paid: true,
  },
  {
    id: "6",
    eventTitle: "Ballet for Beginners",
    childName: "Ava Wilson",
    parentName: "Robert Wilson",
    parentEmail: "robert.wilson@example.com",
    date: "Mondays & Wednesdays",
    registrationDate: "2023-06-01",
    status: "cancelled",
    paid: false,
  },
];

const RegistrationsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter registrations based on search query and status filter
  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.eventTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      registration.childName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      registration.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && registration.status === "confirmed") ||
      (statusFilter === "pending" && registration.status === "pending") ||
      (statusFilter === "cancelled" && registration.status === "cancelled");

    return matchesSearch && matchesStatus;
  });

  const handleExportRegistrations = () => {
    console.log("Exporting registrations");
    // In a real app, you would generate and download a CSV file
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Registrations</h1>
              <p className="text-muted-foreground">
                Manage event registrations
              </p>
            </div>
            <Button variant="outline" onClick={handleExportRegistrations}>
              <Download className="h-4 w-4 mr-2" /> Export All
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event, child, or parent..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="md:w-auto w-full flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <Tabs
                    defaultValue={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registrations List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Registrations</CardTitle>
                <CardDescription>
                  Showing {filteredRegistrations.length} of{" "}
                  {registrations.length} registrations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRegistrations.length > 0 ? (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">
                          Event
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Child
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Parent
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Registration Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Payment
                        </th>
                        <th className="text-right py-3 px-4 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredRegistrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {registration.eventTitle}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {registration.childName}
                          </td>
                          <td className="py-3 px-4">
                            <div>{registration.parentName}</div>
                            <div className="text-xs text-muted-foreground">
                              {registration.parentEmail}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {registration.date}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {registration.registrationDate}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                registration.status === "confirmed"
                                  ? "default"
                                  : registration.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {registration.status === "confirmed"
                                ? "Confirmed"
                                : registration.status === "pending"
                                  ? "Pending"
                                  : "Cancelled"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {registration.paid ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700"
                              >
                                Paid
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700"
                              >
                                Pending
                              </Badge>
                            )}
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
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No registrations found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationsList;
