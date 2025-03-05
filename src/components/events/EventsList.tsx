import { useState } from "react";
import EventCard from "./EventCard";
import EventFilters from "./EventFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

// Mock data for events
const allEvents = [
  {
    id: "1",
    title: "Summer Art Camp",
    description:
      "A fun-filled week of creative art activities for children to explore their artistic talents.",
    date: "July 15-19, 2023",
    time: "9:00 AM - 12:00 PM",
    location: "Community Arts Center",
    ageGroup: "7-12 years",
    category: "Arts & Crafts",
    imageUrl:
      "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80",
  },
  {
    id: "2",
    title: "Junior Soccer League",
    description:
      "Weekly soccer training and matches for kids to develop teamwork and athletic skills.",
    date: "Every Saturday",
    time: "10:00 AM - 11:30 AM",
    location: "City Sports Park",
    ageGroup: "5-8 years",
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80",
  },
  {
    id: "3",
    title: "Coding for Kids",
    description:
      "Introduction to programming concepts through fun, interactive projects and games.",
    date: "June 5-26, 2023",
    time: "4:00 PM - 5:30 PM",
    location: "Tech Learning Center",
    ageGroup: "9-14 years",
    category: "Education",
    imageUrl:
      "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=600&q=80",
  },
  {
    id: "4",
    title: "Music & Movement",
    description:
      "Early childhood music class combining songs, dance, and instrument exploration.",
    date: "Tuesdays & Thursdays",
    time: "10:00 AM - 11:00 AM",
    location: "Harmony Music Studio",
    ageGroup: "2-5 years",
    category: "Music",
    imageUrl:
      "https://images.unsplash.com/photo-1445633629932-0029acc44e88?w=600&q=80",
  },
  {
    id: "5",
    title: "Science Adventure Camp",
    description:
      "Hands-on science experiments and outdoor exploration for curious young minds.",
    date: "August 7-11, 2023",
    time: "9:00 AM - 3:00 PM",
    location: "Discovery Science Center",
    ageGroup: "8-12 years",
    category: "Education",
    imageUrl:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80",
  },
  {
    id: "6",
    title: "Ballet for Beginners",
    description:
      "Introduction to ballet basics with a focus on fun, movement, and coordination.",
    date: "Mondays & Wednesdays",
    time: "3:30 PM - 4:30 PM",
    location: "Grace Dance Academy",
    ageGroup: "4-7 years",
    category: "Arts & Crafts",
    imageUrl:
      "https://images.unsplash.com/photo-1595932545692-6cc0e5db9f7f?w=600&q=80",
  },
  {
    id: "7",
    title: "Wilderness Explorers",
    description:
      "Outdoor adventure program teaching survival skills, nature appreciation, and teamwork.",
    date: "July 24-28, 2023",
    time: "8:30 AM - 4:00 PM",
    location: "Pinewood Nature Reserve",
    ageGroup: "10-15 years",
    category: "Camps",
    imageUrl:
      "https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=600&q=80",
  },
  {
    id: "8",
    title: "Little Chefs Cooking Class",
    description:
      "Fun cooking classes where kids learn to make simple, delicious recipes.",
    date: "Fridays",
    time: "4:00 PM - 5:30 PM",
    location: "Culinary Kids Studio",
    ageGroup: "6-10 years",
    category: "Education",
    imageUrl:
      "https://images.unsplash.com/photo-1577301656525-dced3dbdcb90?w=600&q=80",
  },
];

const EventsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("All Ages");
  const [showFilters, setShowFilters] = useState(false);

  // Filter events based on search query and filters
  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Events" || event.category === selectedCategory;

    // Simple age group filtering (in a real app, this would be more sophisticated)
    const matchesAgeGroup =
      selectedAgeGroup === "All Ages" ||
      event.ageGroup.includes(selectedAgeGroup);

    return matchesSearch && matchesCategory && matchesAgeGroup;
  });

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
                selectedAgeGroup={selectedAgeGroup}
                setSelectedAgeGroup={setSelectedAgeGroup}
              />
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredEvents.length > 0 ? (
          <>
            <div className="mb-6 text-muted-foreground">
              Showing {filteredEvents.length} events
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
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
                setSelectedAgeGroup("All Ages");
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
