import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  date: z.date(),
  location: z.string().min(3, { message: "Location is required" }),
  category: z.string(),
  ageGroups: z.array(
    z.object({
      minAge: z.string(),
      maxAge: z.string(),
    }),
  ),
  capacity: z.string(),
  price: z.string().optional(),
  isPaid: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  initialData?: EventFormValues;
  onSubmit?: (data: EventFormValues) => void;
  isEditing?: boolean;
}

const EventForm = ({
  initialData,
  onSubmit = () => {},
  isEditing = false,
}: EventFormProps) => {
  const defaultValues: Partial<EventFormValues> = {
    title: "",
    description: "",
    date: new Date(),
    location: "",
    category: "sports",
    ageGroups: [{ minAge: "3", maxAge: "5" }],
    capacity: "20",
    price: "",
    isPaid: false,
    ...initialData,
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const isPaid = form.watch("isPaid");

  const [ageGroups, setAgeGroups] = useState(
    defaultValues.ageGroups || [{ minAge: "3", maxAge: "5" }],
  );

  const addAgeGroup = () => {
    setAgeGroups([...ageGroups, { minAge: "", maxAge: "" }]);
  };

  const removeAgeGroup = (index: number) => {
    const updatedAgeGroups = [...ageGroups];
    updatedAgeGroups.splice(index, 1);
    setAgeGroups(updatedAgeGroups);
  };

  const handleSubmit = (data: EventFormValues) => {
    // Update the ageGroups in the form data before submitting
    const formData = {
      ...data,
      ageGroups: ageGroups,
    };
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Event" : "Create New Event"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Camp 2023" {...field} />
                  </FormControl>
                  <FormDescription>The name of your event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="arts">Arts & Crafts</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="camp">Camp</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Category of the event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide details about your event..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe what participants can expect
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When will the event take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, State" {...field} />
                  </FormControl>
                  <FormDescription>
                    Where the event will be held
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Age Groups */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel className="text-base">Age Groups</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgeGroup}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Age Group
              </Button>
            </div>

            {ageGroups.map((ageGroup, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="w-1/3">
                  <FormLabel className={index !== 0 ? "sr-only" : ""}>
                    Min Age
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="Min Age"
                    value={ageGroup.minAge}
                    onChange={(e) => {
                      const newAgeGroups = [...ageGroups];
                      newAgeGroups[index].minAge = e.target.value;
                      setAgeGroups(newAgeGroups);
                    }}
                  />
                </div>
                <div className="w-1/3">
                  <FormLabel className={index !== 0 ? "sr-only" : ""}>
                    Max Age
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="Max Age"
                    value={ageGroup.maxAge}
                    onChange={(e) => {
                      const newAgeGroups = [...ageGroups];
                      newAgeGroups[index].maxAge = e.target.value;
                      setAgeGroups(newAgeGroups);
                    }}
                  />
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAgeGroup(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <FormDescription>
              Specify age ranges for participants
            </FormDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="20" {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum number of participants
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Paid Event</FormLabel>
                    <FormDescription>
                      Check if this is a paid event
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {isPaid && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="29.99" {...field} />
                  </FormControl>
                  <FormDescription>Cost per participant</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EventForm;
