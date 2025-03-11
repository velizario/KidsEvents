import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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

// Mock registration data
const registrationData = {
  id: "1",
  eventTitle: "Summer Art Camp",
  eventDate: "July 15-19, 2023",
  eventTime: "9:00 AM - 12:00 PM",
  eventLocation: "Community Arts Center, 123 Main St, Anytown",
  eventImageUrl:
    "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80",
  price: "$175",
  status: "confirmed",
  paymentStatus: "paid",
  registrationDate: "2023-06-10",
  confirmationCode: "ART-2023-1234",
  child: {
    firstName: "Emma",
    lastName: "Johnson",
    age: 8,
    allergies: "None",
    specialNeeds: "",
  },
  parent: {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 123-4567",
  },
  organizer: {
    name: "Community Arts Center",
    email: "info@communityartscenter.org",
    phone: "(555) 987-6543",
  },
};

const RegistrationDetails = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // In a real app, you would fetch the registration data based on the registrationId
  // const registration = useRegistration(registrationId);

  const handleCancelRegistration = () => {
    console.log(`Canceling registration ${registrationId}`);
    // In a real app, you would update the registration status
    setCancelDialogOpen(false);
    // navigate('/parent/dashboard');
  };

  const handleDownloadTicket = () => {
    console.log(`Downloading ticket for registration ${registrationId}`);
    // In a real app, you would generate and download a PDF ticket
  };

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
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">{registrationData.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Payment Status
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            registrationData.paymentStatus === "paid"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }
                        >
                          {registrationData.paymentStatus === "paid" ? (
                            <>
                              <Check className="h-3 w-3 mr-1" /> Paid
                            </>
                          ) : (
                            <>Pending</>
                          )}
                        </Badge>
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
                          {registrationData.child.firstName}{" "}
                          {registrationData.child.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p>{registrationData.child.age} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Allergies
                        </p>
                        <p>{registrationData.child.allergies}</p>
                      </div>
                      {registrationData.child.specialNeeds && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Special Needs
                          </p>
                          <p>{registrationData.child.specialNeeds}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Parent Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{registrationData.parent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${registrationData.parent.email}`}
                            className="text-primary hover:underline"
                          >
                            {registrationData.parent.email}
                          </a>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${registrationData.parent.phone}`}
                            className="hover:underline"
                          >
                            {registrationData.parent.phone}
                          </a>
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
                      {registrationData.organizer.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${registrationData.organizer.email}`}
                        className="text-primary hover:underline"
                      >
                        {registrationData.organizer.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${registrationData.organizer.phone}`}
                        className="hover:underline"
                      >
                        {registrationData.organizer.phone}
                      </a>
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
                      <Link to={`/events/${registrationData.id}`}>
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
