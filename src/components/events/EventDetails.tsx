import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/models";

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [isSaved, setIsSaved] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);
  const { event, loading, error, fetchEvent } = useEvents();
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId).catch((err) => {
        console.error("Error fetching event:", err);
      });
    }
  }, [eventId, fetchEvent]);

  useEffect(() => {
    if (event) {
      setEventData(event);
    }
  }, [event]);

  const handleSaveEvent = () => {
    setIsSaved(!isSaved);
    // In a real app, you would save/unsave the event in the database
  };

  const handleShareEvent = () => {
    // In a real app, you would implement sharing functionality
    if (navigator.share && eventData) {
      navigator.share({
        title: eventData.title,
        text: eventData.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      console.log("Web Share API not supported");
      // You could show a modal with share options instead
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading event details...</span>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Error Loading Event
          </h2>
          <p className="text-muted-foreground mb-6">
            The event could not be found or there was an error loading it.
          </p>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Event Header */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img
          src={
            eventData.imageUrl ||
            "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80"
          }
          alt={eventData.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <Badge className="mb-2">{eventData.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {eventData.title}
                </h1>
                <p className="text-white/90 max-w-2xl">
                  {eventData.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white"
                  onClick={handleSaveEvent}
                >
                  <Heart className={`h-5 w-5 ${isSaved ? "fill-white" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white"
                  onClick={handleShareEvent}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/events">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Link>
        </Button>
      </div>

      {/* Event Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="organizer">Organizer</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          eventData.longDescription ||
                          eventData.description ||
                          "",
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organizer" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <img
                          src={eventData.organizer.imageUrl}
                          alt={eventData.organizer.name}
                          className="w-full h-auto rounded-lg object-cover aspect-square"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <h3 className="text-xl font-bold mb-2">
                          {eventData.organizer.name}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {eventData.organizer.description}
                        </p>
                        <div className="space-y-2">
                          {eventData.organizer?.contactEmail && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Email:</span>
                              <a
                                href={`mailto:${eventData.organizer.contactEmail}`}
                                className="text-primary hover:underline"
                              >
                                {eventData.organizer.contactEmail}
                              </a>
                            </p>
                          )}
                          {eventData.organizer?.contactPhone && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Phone:</span>
                              <a
                                href={`tel:${eventData.organizer.contactPhone}`}
                                className="text-primary hover:underline"
                              >
                                {eventData.organizer.contactPhone}
                              </a>
                            </p>
                          )}
                          {eventData.organizer?.website && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Website:</span>
                              <a
                                href={`https://${eventData.organizer.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {eventData.organizer.website}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-20">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{eventData.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{eventData.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">{eventData.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Age Group
                        </p>
                        <p className="font-medium">{eventData.ageGroup}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-lg font-bold">{eventData.price}</p>
                      <p className="text-sm text-muted-foreground">
                        {eventData.registrations} / {eventData.capacity}{" "}
                        registered
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(eventData.registrations / eventData.capacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <Button className="w-full" size="lg" asChild>
                      <Link to={`/events/${eventId}/register`}>
                        Register Now
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

export default EventDetails;
