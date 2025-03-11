import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Star,
  ChevronRight,
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

// Mock organizer data
const organizerData = {
  id: "1",
  name: "Community Arts Center",
  description:
    "A non-profit organization dedicated to providing arts education and experiences for children and adults in our community.",
  longDescription: `<p>The Community Arts Center was founded in 1985 with a mission to make arts education accessible to all members of our community. We believe that creative expression is essential for personal growth and development, especially in children.</p>
    <p>Our programs are designed to:</p>
    <ul>
      <li>Inspire creativity and self-expression</li>
      <li>Build confidence and social skills</li>
      <li>Develop problem-solving abilities</li>
      <li>Foster appreciation for diverse art forms</li>
      <li>Create a sense of community through shared artistic experiences</li>
    </ul>
    <p>Our instructors are professional artists and educators with extensive experience working with children of all ages and abilities. We maintain small class sizes to ensure personalized attention for each participant.</p>`,
  contactEmail: "info@communityartscenter.org",
  contactPhone: "(555) 123-4567",
  website: "www.communityartscenter.org",
  address: "123 Main St, Anytown, CA 12345",
  imageUrl:
    "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80",
  rating: 4.8,
  reviewCount: 156,
  yearEstablished: 1985,
};

// Mock events data
const eventsData = [
  {
    id: "1",
    title: "Summer Art Camp",
    date: "July 15-19, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80",
    category: "Arts & Crafts",
    ageGroup: "7-12 years",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Painting for Kids",
    date: "Every Saturday",
    imageUrl:
      "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&q=80",
    category: "Arts & Crafts",
    ageGroup: "5-8 years",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Teen Art Studio",
    date: "Wednesdays",
    imageUrl:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
    category: "Arts & Crafts",
    ageGroup: "13-17 years",
    status: "upcoming",
  },
  {
    id: "4",
    title: "Spring Break Art Camp",
    date: "March 15-19, 2023",
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
    category: "Arts & Crafts",
    ageGroup: "7-12 years",
    status: "past",
  },
];

// Mock reviews data
const reviewsData = [
  {
    id: "1",
    userName: "Sarah Johnson",
    rating: 5,
    date: "2023-05-15",
    comment:
      "My daughter absolutely loved the Summer Art Camp! The instructors were amazing and she came home with beautiful artwork every day. Highly recommend!",
    eventTitle: "Summer Art Camp",
  },
  {
    id: "2",
    userName: "Michael Williams",
    rating: 5,
    date: "2023-04-22",
    comment:
      "The Painting for Kids class has been wonderful for my son. He looks forward to it every week and has shown remarkable improvement in his artistic skills.",
    eventTitle: "Painting for Kids",
  },
  {
    id: "3",
    userName: "Jennifer Davis",
    rating: 4,
    date: "2023-03-10",
    comment:
      "Great organization with passionate instructors. My only suggestion would be to offer more weekend classes for working parents.",
    eventTitle: "Teen Art Studio",
  },
];

const OrganizerProfile = () => {
  const { organizerId } = useParams<{ organizerId: string }>();
  const [activeTab, setActiveTab] = useState("about");

  // In a real app, you would fetch the organizer data based on the organizerId
  // const organizer = useOrganizer(organizerId);

  // Filter events to show upcoming and past separately
  const upcomingEvents = eventsData.filter(
    (event) => event.status === "upcoming",
  );
  const pastEvents = eventsData.filter((event) => event.status === "past");

  return (
    <div className="min-h-screen bg-background">
      {/* Organizer Header */}
      <div className="relative h-[200px] md:h-[250px] w-full overflow-hidden bg-primary/10">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-4 border-white shadow-md bg-white">
              <img
                src={organizerData.imageUrl}
                alt={organizerData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {organizerData.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">
                    {organizerData.rating}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  ({organizerData.reviewCount} reviews)
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Est. {organizerData.yearEstablished}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                {organizerData.description}
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
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: organizerData.longDescription,
                      }}
                    />
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
                          {reviewsData.length} reviews from parents
                        </CardDescription>
                      </div>
                      <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">
                          {organizerData.rating}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          / 5
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviewsData.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {review.userName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {review.eventTitle}
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
                          href={`mailto:${organizerData.contactEmail}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {organizerData.contactEmail}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${organizerData.contactPhone}`}
                          className="font-medium"
                        >
                          {organizerData.contactPhone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <a
                          href={`https://${organizerData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {organizerData.website}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{organizerData.address}</p>
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
