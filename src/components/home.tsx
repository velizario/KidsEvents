import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Loader } from "lucide-react";
import EventCard from "./events/EventCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/models";

const categories = [
  { name: "All Events", icon: "🎯" },
  { name: "Sports", icon: "⚽" },
  { name: "Arts & Crafts", icon: "🎨" },
  { name: "Education", icon: "📚" },
  { name: "Music", icon: "🎵" },
  { name: "Camps", icon: "🏕️" },
];

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const { events, loading, error, fetchEvents } = useEvents();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchEvents();
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    loadEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (events && events.length > 0) {
      // Get up to 4 events for the featured section
      setFeaturedEvents(events.slice(0, 4));
    }
  }, [events]);

  const handleSearch = () => {
    navigate(`/events?search=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1200&q=80"
          alt="Children playing"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-start">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Amazing <br />
            Children's Events
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-xl">
            Connect with the best activities, classes, and camps for your
            children in your area
          </p>
          <div className="w-full max-w-md flex bg-white rounded-lg overflow-hidden shadow-lg">
            <Input
              type="text"
              placeholder="Search for events..."
              className="flex-grow border-none focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button className="rounded-none" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === category.name ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link to="/events">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading events...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                There was a problem loading events. Please try again later.
              </p>
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  ageGroup={event.ageGroup}
                  category={event.category}
                  imageUrl={event.imageUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No events found. Check back later for upcoming events!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Events</h3>
              <p className="text-muted-foreground">
                Browse through hundreds of children's events and activities in
                your area.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Register Easily</h3>
              <p className="text-muted-foreground">
                Simple registration process with all the information you need in
                one place.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Activities</h3>
              <p className="text-muted-foreground">
                Your children participate in enriching, fun, and educational
                experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Are You an Event Organizer?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            List your children's events on our platform and reach thousands of
            parents in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/register/organizer">Register as Organizer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">KidsEvents</h3>
              <p className="text-muted-foreground">
                Connecting families with enriching activities for children.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/events"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Organizers</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/register/organizer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    List Your Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-muted-foreground">
                  support@kidsevents.com
                </li>
                <li className="text-muted-foreground">(555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>
              © {new Date().getFullYear()} KidsEvents. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
