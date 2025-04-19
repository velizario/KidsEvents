import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useEvents } from "@/hooks/useEvents";
import { Event, Registration } from "@/types/models";

const RegistrationConfirmation = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { fetchRegistration } = useRegistrations();
  const { fetchEvent } = useEvents();
  const [registration, setRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!eventId) {
        setError(new Error("Event ID is missing"));
        setLoading(false);
        return;
      }

      try {
        // Fetch the event details
        const eventData = await fetchEvent(eventId);
        setEvent(eventData);

        // For now, we don't have a way to get the registration ID directly
        // In a real app, you would either:
        // 1. Pass the registration ID in the URL
        // 2. Store it in state/context when registration completes
        // 3. Query for the most recent registration for this user and event

        // For this demo, we'll just show the event details and a success message
      } catch (err) {
        console.error("Error loading confirmation data:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load confirmation details")
        );
      } finally {
        setLoading(false);
      }
    };

    // Only run once when the component mounts or when eventId changes
    if (loading) {
      loadData();
    }
  }, [eventId, fetchEvent, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading confirmation details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load confirmation details"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Registration Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for registering for this event. Your spot has been
            secured.
          </p>
        </div>

        {event && (
          <Card className="mb-8 overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={
                  event.imageUrl ||
                  "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&q=80"
                }
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">{event.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Registration Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Registration Status
                </p>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Confirmed
                </Badge>
              </div>

              <Separator />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-6">
            <div className="w-full flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your registered email
                address.
              </p>
              <Button variant="outline" size="sm" className="shrink-0">
                <Download className="h-4 w-4 mr-2" />
                Save Ticket
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/parent/dashboard">View My Registrations</Link>
          </Button>
          <Button asChild>
            <Link to="/events">
              Browse More Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;
