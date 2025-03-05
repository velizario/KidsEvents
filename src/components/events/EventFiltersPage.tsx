import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, X } from "lucide-react";
import { format } from "date-fns";

const EventFiltersPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState([10]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState([5, 12]);

  const categories = [
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "arts", name: "Arts & Crafts", icon: "🎨" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "music", name: "Music", icon: "🎵" },
    { id: "camps", name: "Camps", icon: "🏕️" },
    { id: "dance", name: "Dance", icon: "💃" },
    { id: "science", name: "Science", icon: "🔬" },
    { id: "cooking", name: "Cooking", icon: "🍳" },
    { id: "outdoor", name: "Outdoor", icon: "🌳" },
    { id: "tech", name: "Technology", icon: "💻" },
  ];

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId),
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const clearFilters = () => {
    setSelectedDate(undefined);
    setLocation("");
    setDistance([10]);
    setSelectedCategories([]);
    setAgeRange([5, 12]);
  };

  const applyFilters = () => {
    // In a real app, this would apply filters and navigate back to results
    console.log({
      date: selectedDate,
      location,
      distance: distance[0],
      categories: selectedCategories,
      ageRange,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-white border-b border-border z-40 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Filters</h1>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Date Filter */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Date</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={!selectedDate ? "default" : "outline"}
              onClick={() => setSelectedDate(undefined)}
              className="justify-start"
            >
              Any Date
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedDate ? "default" : "outline"}
                  className="justify-start"
                >
                  {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
                  <CalendarIcon className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Location</h2>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter city or zip code"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            {location && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setLocation("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Distance</span>
              <span className="text-sm font-medium">{distance[0]} miles</span>
            </div>
            <Slider
              defaultValue={[10]}
              max={50}
              step={5}
              value={distance}
              onValueChange={setDistance}
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Categories</h2>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategories.includes(category.id)
                    ? "default"
                    : "outline"
                }
                className="justify-start"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Age Range Filter */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-medium">Age Range</h2>
            <span className="text-sm font-medium">
              {ageRange[0]} - {ageRange[1]} years
            </span>
          </div>
          <Slider
            defaultValue={[5, 12]}
            max={18}
            min={0}
            step={1}
            value={ageRange}
            onValueChange={setAgeRange}
          />
        </div>

        {/* Apply Filters Button */}
        <div className="pt-4">
          <Button className="w-full" size="lg" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventFiltersPage;
