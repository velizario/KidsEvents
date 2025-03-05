import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";

interface EventFiltersProps {
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  selectedAgeGroup: string;
  setSelectedAgeGroup: Dispatch<SetStateAction<string>>;
}

const EventFilters = ({
  selectedCategory = "All Events",
  setSelectedCategory,
  selectedAgeGroup = "All Ages",
  setSelectedAgeGroup,
}: EventFiltersProps) => {
  const categories = [
    "All Events",
    "Sports",
    "Arts & Crafts",
    "Education",
    "Music",
    "Camps",
  ];

  const ageGroups = [
    "All Ages",
    "0-2 years",
    "3-5 years",
    "6-8 years",
    "9-12 years",
    "13+ years",
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

        {/* Age Groups */}
        <div>
          <h3 className="font-medium mb-3">Age Groups</h3>
          <div className="flex flex-wrap gap-2">
            {ageGroups.map((age) => (
              <Button
                key={age}
                variant={selectedAgeGroup === age ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAgeGroup(age)}
                className="rounded-full"
              >
                {age}
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
            setSelectedAgeGroup("All Ages");
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default EventFilters;
