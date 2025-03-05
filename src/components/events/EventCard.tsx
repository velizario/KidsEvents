import React from "react";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  ageGroup?: string;
  category?: string;
  imageUrl?: string;
  onRegister?: (id: string) => void;
}

const EventCard = ({
  id = "1",
  title = "Summer Art Camp",
  description = "A fun-filled week of creative art activities for children to explore their artistic talents.",
  date = "July 15-19, 2023",
  time = "9:00 AM - 12:00 PM",
  location = "Community Arts Center",
  ageGroup = "7-12 years",
  category = "Arts & Crafts",
  imageUrl = "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80",
  onRegister = () => console.log("Register clicked"),
}: EventCardProps) => {
  return (
    <Card className="w-full max-w-[300px] overflow-hidden flex flex-col h-[350px] bg-white">
      <div className="relative h-40 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 bg-opacity-90"
        >
          {category}
        </Badge>
      </div>

      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-bold line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2 mt-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{ageGroup}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => onRegister(id)}>
          Register Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
