import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock event data
const eventData = {
  id: "1",
  title: "Summer Art Camp",
  description:
    "A fun-filled week of creative art activities for children to explore their artistic talents. Activities include painting, drawing, sculpture, and mixed media projects. All materials are provided.",
  longDescription: `<p>Join us for an exciting week of creativity and artistic exploration! Our Summer Art Camp is designed to inspire young artists and provide them with a supportive environment to develop their skills.</p>
    <p>Each day will focus on different artistic techniques and mediums:</p>
    <ul>
      <li><strong>Monday:</strong> Drawing fundamentals with pencil, charcoal, and pastels</li>
      <li><strong>Tuesday:</strong> Painting techniques with watercolors and acrylics</li>
      <li><strong>Wednesday:</strong> Sculpture and 3D art with clay and mixed materials</li>
      <li><strong>Thursday:</strong> Mixed media projects combining various techniques</li>
      <li><strong>Friday:</strong> Final project and art exhibition for parents</li>
    </ul>
    <p>All materials are provided, and children will bring home their completed artwork at the end of each day. A light snack will be provided, but please send your child with a water bottle and lunch.</p>
    <p>Our instructors are experienced art educators who are passionate about fostering creativity in children. The camp maintains a low student-to-teacher ratio to ensure personalized attention.</p>`,
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
  organizer: {
    name: "Community Arts Center",
    description:
      "A non-profit organization dedicated to providing arts education and experiences for children and adults in our community.",
    contactEmail: "info@communityartscenter.org",
    contactPhone: "(555) 123-4567",
    website: "www.communityartscenter.org",
    imageUrl:
      "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80",
  },
};

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [isSaved, setIsSaved] = useState(false);

  // In a real app, you would fetch the event data based on the eventId
  // const event = useEvent(eventId);

  const handleSaveEvent = () => {
    setIsSaved(!isSaved);
    // In a real app, you would save/unsave the event in the database
  };

  const handleShareEvent = () => {
    // In a real app, you would implement sharing functionality
    if (navigator.share) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Event Header */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <img
          src={eventData.imageUrl}
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
                        __html: eventData.longDescription,
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
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Email:</span>
                            <a
                              href={`mailto:${eventData.organizer.contactEmail}`}
                              className="text-primary hover:underline"
                            >
                              {eventData.organizer.contactEmail}
                            </a>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Phone:</span>
                            <a
                              href={`tel:${eventData.organizer.contactPhone}`}
                              className="text-primary hover:underline"
                            >
                              {eventData.organizer.contactPhone}
                            </a>
                          </p>
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
