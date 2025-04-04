import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Star,
  ChevronRight,
  ArrowLeft,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authAPI, eventAPI, reviewAPI } from "@/lib/api";
import { Organizer, Event, Review } from "@/types/models";

const OrganizerProfile = () => {
  const { organizerId } = useParams<{ organizerId: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (!organizerId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch organizer profile
        const organizerData = await authAPI.getUserProfile(
          organizerId,
          "organizer",
        );
        setOrganizer(organizerData as Organizer);

        // Fetch organizer's events
        const eventsData = await eventAPI.getEventsByOrganizer(organizerId);
        setEvents(eventsData);

        // Fetch organizer's reviews
        const reviewsData = await reviewAPI.getOrganizerReviews(organizerId);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching organizer data:", err);
        setError("Failed to load organizer data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerData();
  }, [organizerId]);

  // Filter events to show upcoming and past separately
  const upcomingEvents = events.filter(
    (event) => event.status === "active" || event.status === "draft",
  );
  const pastEvents = events.filter(
    (event) => event.status === "completed" || event.status === "cancelled",
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading organizer profile...</span>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-destructive mb-4">
          Error: {error || "Organizer not found"}
        </div>
        <Button variant="outline" asChild>
          <Link to="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Organizer Header */}
      <div className="relative h-[200px] md:h-[250px] w-full overflow-hidden bg-primary/10">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-4 border-white shadow-md bg-white">
              <img
                src={
                  organizer.imageUrl ||
                  "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80"
                }
                alt={organizer.organizationName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {organizer.organizationName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">
                    {organizer.rating || "N/A"}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  ({organizer.reviewCount || 0} reviews)
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Est. {organizer.yearEstablished || "N/A"}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                {organizer.description}
              </p>
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

      {/* Organizer Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      {organizer.longDescription ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: organizer.longDescription,
                          }}
                        />
                      ) : (
                        <p>{organizer.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>
                      Events currently open for registration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex border rounded-lg overflow-hidden"
                          >
                            <div className="w-1/3 h-auto">
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="w-2/3 p-4">
                              <h3 className="font-medium">{event.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {event.date}
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline">
                                  {event.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {event.ageGroup}
                                </span>
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="px-0 mt-2"
                                asChild
                              >
                                <Link to={`/events/${event.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No upcoming events at this time.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {pastEvents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Past Events</CardTitle>
                      <CardDescription>Previously held events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pastEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex border rounded-lg overflow-hidden bg-muted/30"
                          >
                            <div className="w-1/3 h-auto opacity-80">
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="w-2/3 p-4">
                              <h3 className="font-medium">{event.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {event.date}
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline">
                                  {event.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {event.ageGroup}
                                </span>
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="px-0 mt-2"
                                asChild
                              >
                                <Link to={`/events/${event.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Reviews</CardTitle>
                        <CardDescription>
                          {reviews.length} reviews from parents
                        </CardDescription>
                      </div>
                      <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">
                          {organizer.rating || "N/A"}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          / 5
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border-b border-border pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {review.parentName || "Anonymous"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {review.eventTitle || "Event"}
                                </div>
                              </div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                                  />
                                ))}
                                <span className="text-xs text-muted-foreground ml-2">
                                  {review.date}
                                </span>
                              </div>
                            </div>
                            <p className="mt-2 text-sm">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No reviews yet</p>
                      </div>
                    )}
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
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${organizer.email}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {organizer.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${organizer.phone}`}
                          className="font-medium"
                        >
                          {organizer.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <a
                          href={`https://${organizer.website || "#"}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {organizer.website || "N/A"}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {organizer.address
                            ? `${organizer.address}${organizer.city ? `, ${organizer.city}` : ""}${organizer.state ? `, ${organizer.state}` : ""}${organizer.zipCode ? ` ${organizer.zipCode}` : ""}`
                            : "Address not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button className="w-full" asChild>
                      <Link to={`/events?organizer=${organizerId}`}>
                        View All Events
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

export default OrganizerProfile;
