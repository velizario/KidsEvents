import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Trash2,
  Users,
  X,
  Check,
  Download,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock event data
const eventData = {
  id: "1",
  title: "Summer Art Camp",
  description:
    "A fun-filled week of creative art activities for children to explore their artistic talents. Activities include painting, drawing, sculpture, and mixed media projects. All materials are provided.",
  date: "July 15-19, 2023",
  time: "9:00 AM - 12:00 PM",
  location: "Community Arts Center, 123 Main St, Anytown",
  ageGroup: "7-12 years",
  category: "Arts & Crafts",
  capacity: 25,
  registrations: 18,
  price: "$175",
  status: "active",
  imageUrl:
    "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80",
};

// Mock participants data
const participantsData = [
  {
    id: "1",
    childName: "Emma Johnson",
    childAge: 8,
    parentName: "Sarah Johnson",
    parentEmail: "sarah.johnson@example.com",
    parentPhone: "(555) 123-4567",
    registrationDate: "2023-06-10",
    status: "confirmed",
    paid: true,
  },
  {
    id: "2",
    childName: "Noah Williams",
    childAge: 10,
    parentName: "Michael Williams",
    parentEmail: "michael.williams@example.com",
    parentPhone: "(555) 234-5678",
    registrationDate: "2023-06-08",
    status: "confirmed",
    paid: true,
  },
  {
    id: "3",
    childName: "Olivia Davis",
    childAge: 7,
    parentName: "Jennifer Davis",
    parentEmail: "jennifer.davis@example.com",
    parentPhone: "(555) 345-6789",
    registrationDate: "2023-06-07",
    status: "pending",
    paid: false,
  },
  {
    id: "4",
    childName: "Liam Brown",
    childAge: 9,
    parentName: "David Brown",
    parentEmail: "david.brown@example.com",
    parentPhone: "(555) 456-7890",
    registrationDate: "2023-06-05",
    status: "confirmed",
    paid: true,
  },
  {
    id: "5",
    childName: "Sophia Miller",
    childAge: 11,
    parentName: "Jessica Miller",
    parentEmail: "jessica.miller@example.com",
    parentPhone: "(555) 567-8901",
    registrationDate: "2023-06-02",
    status: "confirmed",
    paid: true,
  },
];

const EventManagement = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelRegistrationId, setCancelRegistrationId] = useState<
    string | null
  >(null);

  // In a real app, you would fetch the event data based on the eventId
  // const event = useEvent(eventId);

  const handleDeleteEvent = () => {
    console.log(`Deleting event ${eventId}`);
    // In a real app, you would delete the event and redirect
    setDeleteDialogOpen(false);
    // navigate('/organizer/dashboard');
  };

  const handleCancelRegistration = (registrationId: string) => {
    console.log(`Canceling registration ${registrationId}`);
    // In a real app, you would update the registration status
    setCancelRegistrationId(null);
  };

  const handleConfirmRegistration = (registrationId: string) => {
    console.log(`Confirming registration ${registrationId}`);
    // In a real app, you would update the registration status
  };

  const handleExportParticipants = () => {
    console.log("Exporting participants list");
    // In a real app, you would generate and download a CSV file
  };

  const handleContactParticipants = () => {
    console.log("Opening contact form for participants");
    // In a real app, you would open a form to send emails to participants
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/organizer/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{eventData.title}</h1>
                <p className="text-muted-foreground">
                  Manage event details and participants
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/events/${eventId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Event
                </Link>
              </Button>
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the event and all associated registrations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteEvent}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="details" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Event Image */}
              <div className="md:col-span-1">
                <Card>
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={eventData.imageUrl}
                      alt={eventData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Badge
                        variant={
                          eventData.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {eventData.status === "active" ? "Active" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{eventData.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{eventData.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{eventData.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{eventData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{eventData.ageGroup}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Details */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">
                        {eventData.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Capacity</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            {eventData.registrations}
                          </span>
                          <span className="text-muted-foreground">
                            /{eventData.capacity} registered
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(eventData.registrations / eventData.capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Price</h3>
                        <p className="text-lg font-semibold">
                          {eventData.price}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Registration Status</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-green-50">
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                          {
                            participantsData.filter(
                              (p) => p.status === "confirmed",
                            ).length
                          }{" "}
                          Confirmed
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50">
                          <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                          {
                            participantsData.filter(
                              (p) => p.status === "pending",
                            ).length
                          }{" "}
                          Pending
                        </Badge>
                        <Badge variant="outline" className="bg-red-50">
                          <X className="h-3 w-3 mr-1 text-red-500" />
                          {participantsData.filter(
                            (p) => p.status === "cancelled",
                          ).length || 0}{" "}
                          Cancelled
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Registered Participants</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportParticipants}
                    >
                      <Download className="h-4 w-4 mr-2" /> Export List
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleContactParticipants}
                    >
                      <Mail className="h-4 w-4 mr-2" /> Contact All
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {participantsData.length} participants registered for this
                  event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">
                            Child Name
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Age
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Parent
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Contact
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
                        {participantsData.map((participant) => (
                          <tr
                            key={participant.id}
                            className="hover:bg-muted/30"
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium">
                                {participant.childName}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {participant.childAge} years
                            </td>
                            <td className="py-3 px-4">
                              {participant.parentName}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                {participant.parentEmail}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {participant.parentPhone}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  participant.status === "confirmed"
                                    ? "default"
                                    : participant.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {participant.status === "confirmed"
                                  ? "Confirmed"
                                  : participant.status === "pending"
                                    ? "Pending"
                                    : "Cancelled"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {participant.paid ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50"
                                >
                                  <Check className="h-3 w-3 mr-1 text-green-500" />{" "}
                                  Paid
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-50"
                                >
                                  <Clock className="h-3 w-3 mr-1 text-yellow-500" />{" "}
                                  Pending
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                {participant.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleConfirmRegistration(participant.id)
                                    }
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Confirm
                                  </Button>
                                )}
                                <AlertDialog
                                  open={cancelRegistrationId === participant.id}
                                  onOpenChange={(open) =>
                                    setCancelRegistrationId(
                                      open ? participant.id : null,
                                    )
                                  }
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                    >
                                      <X className="h-4 w-4 mr-1" /> Cancel
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Cancel this registration?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will cancel the registration for{" "}
                                        {participant.childName}. The parent will
                                        be notified of this cancellation.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Keep Registration
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleCancelRegistration(
                                            participant.id,
                                          )
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Cancel Registration
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventManagement;
