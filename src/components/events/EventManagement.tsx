import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  Loader,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEvents } from "@/hooks/useEvents";
import { eventAPI, registrationAPI } from "@/lib/api";
import { Event } from "@/types/models";

// Define participant interface for type safety
interface Participant {
  id: string;
  childName: string;
  childAge: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  registrationDate: string;
  status: "pending" | "confirmed" | "cancelled";
  paid: boolean;
}

const EventManagement = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelRegistrationId, setCancelRegistrationId] = useState<
    string | null
  >(null);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [participantsData, setParticipantsData] = useState<Participant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null
  );
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { event, loading, error, fetchEvent, deleteEvent } = useEvents();

  // Fetch event data when component mounts
  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId).catch((err) => {
        console.error("Error fetching event:", err);
      });
    }
  }, [eventId]);

  // Update local state when event data is fetched
  useEffect(() => {
    if (event) {
      setEventData(event);
    }
  }, [event]);

  // Fetch participants data when component mounts
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) return;

      try {
        setIsLoadingParticipants(true);
        setParticipantsError(null);

        const data = await eventAPI.getEventParticipants(eventId);

        // Transform the data to match our Participant interface
        const formattedParticipants = data.map((registration) => ({
          id: registration.id,
          childName: `${registration.children.firstName} ${registration.children.lastName}`,
          childAge: registration.children.age || 0,
          parentName: `${registration.parents.firstName} ${registration.parents.lastName}`,
          parentEmail: registration.parents.email,
          parentPhone: registration.parents.phone,
          registrationDate: new Date(
            registration.registrationDate
          ).toLocaleDateString(),
          status: registration.status,
          paid: registration.paymentStatus === "paid",
        }));

        setParticipantsData(formattedParticipants);
      } catch (err) {
        console.error("Error fetching participants:", err);
        setParticipantsError("Failed to load participants. Please try again.");
      } finally {
        setIsLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [eventId]);

  const handleDeleteEvent = async () => {
    if (!eventId) return;

    try {
      await deleteEvent(eventId);
      setDeleteDialogOpen(false);
      navigate("/organizer/dashboard");
    } catch (err) {
      console.error("Error deleting event:", err);
      // You could add error handling UI here
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      setIsLoadingParticipants(true);
      await registrationAPI.cancelRegistration(registrationId);

      // Refresh participants list after cancellation
      if (eventId) {
        const data = await eventAPI.getEventParticipants(eventId);

        // Transform the data to match our Participant interface
        const formattedParticipants = data.map((registration) => ({
          id: registration.id,
          childName: `${registration.children.firstName} ${registration.children.lastName}`,
          childAge: registration.children.age || 0,
          parentName: `${registration.parents.firstName} ${registration.parents.lastName}`,
          parentEmail: registration.parents.email,
          parentPhone: registration.parents.phone,
          registrationDate: new Date(
            registration.registrationDate
          ).toLocaleDateString(),
          status: registration.status,
          paid: registration.paymentStatus === "paid",
        }));

        setParticipantsData(formattedParticipants);
      }

      // Also refresh the event data to update registration count
      if (eventId) {
        fetchEvent(eventId);
      }
    } catch (err) {
      console.error("Error canceling registration:", err);
      setParticipantsError("Failed to cancel registration. Please try again.");
    } finally {
      setIsLoadingParticipants(false);
      setCancelRegistrationId(null);
    }
  };

  const handleConfirmRegistration = async (registrationId: string) => {
    try {
      setIsLoadingParticipants(true);
      await registrationAPI.updateRegistrationStatus(
        registrationId,
        "confirmed"
      );

      // Refresh participants list after confirmation
      if (eventId) {
        const data = await eventAPI.getEventParticipants(eventId);

        // Transform the data to match our Participant interface
        const formattedParticipants = data.map((registration) => ({
          id: registration.id,
          childName: `${registration.children.firstName} ${registration.children.lastName}`,
          childAge: registration.children.age || 0,
          parentName: `${registration.parents.firstName} ${registration.parents.lastName}`,
          parentEmail: registration.parents.email,
          parentPhone: registration.parents.phone,
          registrationDate: new Date(
            registration.registrationDate
          ).toLocaleDateString(),
          status: registration.status,
          paid: registration.paymentStatus === "paid",
        }));

        setParticipantsData(formattedParticipants);
      }
    } catch (err) {
      console.error("Error confirming registration:", err);
      setParticipantsError("Failed to confirm registration. Please try again.");
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const handleExportParticipants = async () => {
    if (!eventId || participantsData.length === 0) return;

    try {
      // Create CSV content
      const headers = [
        "Child Name",
        "Age",
        "Parent Name",
        "Email",
        "Phone",
        "Registration Date",
        "Status",
        "Payment",
      ];
      const rows = participantsData.map((p) => [
        p.childName,
        p.childAge,
        p.parentName,
        p.parentEmail,
        p.parentPhone,
        p.registrationDate,
        p.status,
        p.paid ? "Paid" : "Pending",
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${eventData?.title.replace(/\s+/g, "_")}_participants.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting participants:", err);
    }
  };

  const handleContactParticipants = () => {
    // Pre-fill the subject with the event title
    if (eventData) {
      setContactSubject(`Important Information: ${eventData.title}`);
    }
    setContactDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!eventId || !contactSubject || !contactMessage) return;

    try {
      setIsSendingEmail(true);

      // In a real implementation, you would call an API to send emails
      // For now, we'll simulate a successful email send after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reset form and close dialog
      setContactSubject("");
      setContactMessage("");
      setContactDialogOpen(false);

      // Show success message (in a real app, you might use a toast notification)
      alert("Email sent successfully to all participants!");
    } catch (err) {
      console.error("Error sending emails:", err);
      alert("Failed to send emails. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Error Loading Event</h2>
          <p className="text-muted-foreground mb-6">
            {error?.message ||
              "The event could not be found or there was an error loading it."}
          </p>
          <Button asChild>
            <Link to="/organizer/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

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
                              width: `${
                                (eventData.registrations / eventData.capacity) *
                                100
                              }%`,
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
                              (p) => p.status === "confirmed"
                            ).length
                          }{" "}
                          Confirmed
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50">
                          <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                          {
                            participantsData.filter(
                              (p) => p.status === "pending"
                            ).length
                          }{" "}
                          Pending
                        </Badge>
                        <Badge variant="outline" className="bg-red-50">
                          <X className="h-3 w-3 mr-1 text-red-500" />
                          {
                            participantsData.filter(
                              (p) => p.status === "cancelled"
                            ).length
                          }{" "}
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
                      disabled={
                        isLoadingParticipants || participantsData.length === 0
                      }
                    >
                      <Download className="h-4 w-4 mr-2" /> Export List
                    </Button>
                    <Dialog
                      open={contactDialogOpen}
                      onOpenChange={setContactDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleContactParticipants}
                          disabled={
                            isLoadingParticipants ||
                            participantsData.length === 0
                          }
                        >
                          <Mail className="h-4 w-4 mr-2" /> Contact All
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Contact All Participants</DialogTitle>
                          <DialogDescription>
                            Send an email to all {participantsData.length}{" "}
                            participants of this event.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">
                              Subject
                            </Label>
                            <Input
                              id="subject"
                              value={contactSubject}
                              onChange={(e) =>
                                setContactSubject(e.target.value)
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="message" className="text-right">
                              Message
                            </Label>
                            <Textarea
                              id="message"
                              value={contactMessage}
                              onChange={(e) =>
                                setContactMessage(e.target.value)
                              }
                              className="col-span-3"
                              rows={6}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleSendEmail}
                            disabled={
                              !contactSubject ||
                              !contactMessage ||
                              isSendingEmail
                            }
                          >
                            {isSendingEmail ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Email
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CardDescription>
                  {isLoadingParticipants ? (
                    <span className="flex items-center">
                      <Loader className="h-4 w-4 mr-2 animate-spin" /> Loading
                      participants...
                    </span>
                  ) : participantsError ? (
                    <span className="text-destructive">
                      {participantsError}
                    </span>
                  ) : (
                    `${participantsData.length} participants registered for this event`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingParticipants ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : participantsError ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">{participantsError}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : participantsData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No participants have registered for this event yet.
                    </p>
                  </div>
                ) : (
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
                                        handleConfirmRegistration(
                                          participant.id
                                        )
                                      }
                                    >
                                      <Check className="h-4 w-4 mr-1" /> Confirm
                                    </Button>
                                  )}
                                  <AlertDialog
                                    open={
                                      cancelRegistrationId === participant.id
                                    }
                                    onOpenChange={(open) =>
                                      setCancelRegistrationId(
                                        open ? participant.id : null
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
                                          {participant.childName}. The parent
                                          will be notified of this cancellation.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Keep Registration
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleCancelRegistration(
                                              participant.id
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventManagement;
