import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";

interface EventFiltersProps {
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
}

const EventFilters = ({
  selectedCategory = "All Events",
  setSelectedCategory,
}: EventFiltersProps) => {
  const categories = [
    "All Events",
    "Sports",
    "Arts & Crafts",
    "Education",
    "Music",
    "Camps",
  ];

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <div>
          <h3 className="font-medium mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional filters could be added here */}
      <div className="flex justify-end mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedCategory("All Events");
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default EventFilters;
