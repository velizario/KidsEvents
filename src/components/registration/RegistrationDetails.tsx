import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  Mail,
  Phone,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { registrationAPI } from "@/lib/api";
import { Registration } from "@/types/models";

const RegistrationDetails = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<Registration | null>(
    null
  );

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!registrationId) return;

      try {
        setLoading(true);
        const data = await registrationAPI.getRegistration(registrationId);
        setRegistrationData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching registration:", err);
        setError("Failed to load registration details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [registrationId]);

  const handleCancelRegistration = async () => {
    if (!registrationId) return;

    try {
      setLoading(true);
      await registrationAPI.updateRegistrationStatus(
        registrationId,
        "cancelled"
      );
      // Refresh the registration data
      const updatedData = await registrationAPI.getRegistration(registrationId);
      setRegistrationData(updatedData);
      setCancelDialogOpen(false);
    } catch (err) {
      console.error("Error cancelling registration:", err);
      setError("Failed to cancel registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!registrationId) return;

    try {
      setLoading(true);
      // In a real app, you would generate and download a PDF ticket
      await registrationAPI.downloadTicket(registrationId);
      console.log(`Downloading ticket for registration ${registrationId}`);
    } catch (err) {
      console.error("Error downloading ticket:", err);
      setError("Failed to download ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !registrationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Loading registration details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !registrationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Error Loading Registration</h2>
          <p>{error}</p>
          <Button onClick={() => navigate("/parent/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!registrationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Registration Not Found</h2>
          <p>
            The registration you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => navigate("/parent/dashboard")}>
            Return to Dashboard
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/parent/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Registration Details</h1>
              <p className="text-muted-foreground">
                View your registration information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Registration Information</CardTitle>
                  <Badge
                    variant={
                      registrationData.status === "confirmed"
                        ? "default"
                        : registrationData.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {registrationData.status === "confirmed"
                      ? "Confirmed"
                      : registrationData.status === "pending"
                      ? "Pending"
                      : "Cancelled"}
                  </Badge>
                </div>
                <CardDescription>
                  Registration #{registrationData.confirmationCode}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <img
                        src={registrationData.eventImageUrl}
                        alt={registrationData.eventTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {registrationData.eventTitle}
                      </h3>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{registrationData.eventDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{registrationData.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{registrationData.eventLocation}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Registration Date
                        </p>
                        <p>{registrationData.registrationDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Payment Status
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <h3 className="font-medium mb-3">Child Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>
                          {registrationData.child?.firstName || "N/A"}{" "}
                          {registrationData.child?.lastName || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p>
                          {registrationData.child?.age || "N/A"}{" "}
                          {registrationData.child?.age ? "years" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Parent Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{registrationData.parent?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {registrationData.parent?.email ? (
                            <a
                              href={`mailto:${registrationData.parent.email}`}
                              className="text-primary hover:underline"
                            >
                              {registrationData.parent.email}
                            </a>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {registrationData.parent?.phone ? (
                            <a
                              href={`tel:${registrationData.parent.phone}`}
                              className="hover:underline"
                            >
                              {registrationData.parent.phone}
                            </a>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle>Organizer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">
                      {registrationData.organizer?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {registrationData.organizer?.email ? (
                        <a
                          href={`mailto:${registrationData.organizer.email}`}
                          className="text-primary hover:underline"
                        >
                          {registrationData.organizer.email}
                        </a>
                      ) : (
                        <span>N/A</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {registrationData.organizer?.phone ? (
                        <a
                          href={`tel:${registrationData.organizer.phone}`}
                          className="hover:underline"
                        >
                          {registrationData.organizer.phone}
                        </a>
                      ) : (
                        <span>N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleDownloadTicket}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download Ticket
                    </Button>

                    {registrationData.status !== "cancelled" && (
                      <AlertDialog
                        open={cancelDialogOpen}
                        onOpenChange={setCancelDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            className="w-full"
                            variant="outline"
                            disabled={registrationData.status === "cancelled"}
                          >
                            <X className="h-4 w-4 mr-2" /> Cancel Registration
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel this registration?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel your registration for{" "}
                              {registrationData.eventTitle}. Depending on the
                              event's cancellation policy, you may be eligible
                              for a full or partial refund.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Keep Registration
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelRegistration}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Cancel Registration
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <Button className="w-full" variant="default" asChild>
                      <Link to={`/events/${registrationData.eventId}`}>
                        View Event Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetails;
