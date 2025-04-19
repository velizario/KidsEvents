import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import EventFilters from "./EventFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/models";

const EventsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [showFilters, setShowFilters] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const { events, loading, error, fetchEvents } = useEvents();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchEvents({
          category:
            selectedCategory !== "All Events" ? selectedCategory : undefined,
          search: searchQuery || undefined,
        });
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    loadEvents();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (events) {
      setAllEvents(events);
    }
  }, [events]);

  // We're now using server-side filtering through the API, but keep client-side as backup
  const filteredEvents = allEvents;

  const handleRegister = (id: string) => {
    console.log(`Register for event ${id}`);
    // In a real app, this would navigate to registration page or open a modal
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-primary/5 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
          <p className="text-muted-foreground">
            Find the perfect activities for your children
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="sticky top-16 bg-white border-b border-border z-30 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex bg-muted rounded-lg overflow-hidden">
              <Input
                type="text"
                placeholder="Search events by name, description, or location"
                className="flex-grow border-none bg-transparent focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="ghost" className="rounded-none">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="md:w-auto w-full flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4">
              <EventFilters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading events...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2 text-destructive">
              Error loading events
            </h3>
            <p className="text-muted-foreground mb-6">
              There was a problem fetching events. Please try again later.
            </p>
            <Button onClick={() => fetchEvents()}>Retry</Button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="mb-6 text-muted-foreground">
              Showing {filteredEvents.length} events
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  category={event.category}
                  imageUrl={event.imageUrl}
                  onRegister={handleRegister}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Events");
                fetchEvents();
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
