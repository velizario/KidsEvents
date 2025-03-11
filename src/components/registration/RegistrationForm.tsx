import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
} from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock event data
const eventData = {
  id: "1",
  title: "Summer Art Camp",
  description:
    "A fun-filled week of creative art activities for children to explore their artistic talents.",
  date: "July 15-19, 2023",
  time: "9:00 AM - 12:00 PM",
  location: "Community Arts Center, 123 Main St, Anytown",
  ageGroup: "7-12 years",
  category: "Arts & Crafts",
  price: "$175",
  imageUrl:
    "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80",
};

const formSchema = z.object({
  children: z
    .array(
      z.object({
        firstName: z.string().min(2, { message: "First name is required" }),
        lastName: z.string().min(2, { message: "Last name is required" }),
        age: z
          .string()
          .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
            message: "Please enter a valid age",
          }),
        allergies: z.string().optional(),
        specialNeeds: z.string().optional(),
      }),
    )
    .min(1, { message: "At least one child must be registered" }),
  emergencyContact: z.object({
    name: z.string().min(2, { message: "Emergency contact name is required" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    relationship: z.string().min(2, { message: "Relationship is required" }),
  }),
  paymentMethod: z.enum(["credit", "paypal"]),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

const RegistrationForm = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [children, setChildren] = useState([{ id: 1 }]);

  // In a real app, you would fetch the event data based on the eventId
  // const event = useEvent(eventId);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      children: [
        {
          firstName: "",
          lastName: "",
          age: "",
          allergies: "",
          specialNeeds: "",
        },
      ],
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
      paymentMethod: "credit",
      termsAccepted: false,
    },
  });

  const addChild = () => {
    setChildren([...children, { id: children.length + 1 }]);
    const currentChildren = form.getValues().children;
    form.setValue("children", [
      ...currentChildren,
      {
        firstName: "",
        lastName: "",
        age: "",
        allergies: "",
        specialNeeds: "",
      },
    ]);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      const newChildren = [...children];
      newChildren.splice(index, 1);
      setChildren(newChildren);

      const currentChildren = form.getValues().children;
      currentChildren.splice(index, 1);
      form.setValue("children", currentChildren);
    }
  };

  const onSubmit = (data: RegistrationFormValues) => {
    console.log("Registration submitted:", data);
    // In a real app, you would submit the registration to your backend
    // and then redirect to a confirmation page
    // navigate(`/registration/confirmation/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/events/${eventId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Register for Event</h1>
              <p className="text-muted-foreground">
                Complete the form below to register for this event
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Child Information */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Child Information</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addChild}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Child
                    </Button>
                  </div>

                  {children.map((child, index) => (
                    <Card key={child.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Child {index + 1}</h3>
                          {children.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChild(index)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`children.${index}.firstName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`children.${index}.lastName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name={`children.${index}.age`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="8"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name={`children.${index}.allergies`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Allergies</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="List any allergies or write 'None'"
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`children.${index}.specialNeeds`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Special Needs</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any special needs or accommodations"
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Emergency Contact</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="emergencyContact.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyContact.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(123) 456-7890"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="emergencyContact.relationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship to Child</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Grandparent, Aunt, Friend, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                  <Card>
                    <CardContent className="p-6">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="credit" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Credit Card
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="paypal" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    PayPal
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="termsAccepted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  I agree to the{" "}
                                  <Link
                                    to="/terms"
                                    className="text-primary hover:underline"
                                  >
                                    terms and conditions
                                  </Link>
                                </FormLabel>
                                <FormDescription>
                                  By registering, you agree to our cancellation
                                  policy and liability waiver.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/events/${eventId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit">Complete Registration</Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Event Summary */}
          <div>
            <div className="sticky top-20">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Event Summary
                    </h2>
                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                      <img
                        src={eventData.imageUrl}
                        alt={eventData.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-medium mb-1">
                      {eventData.title}
                    </h3>
                    <Badge className="mb-2">{eventData.category}</Badge>
                    <p className="text-muted-foreground text-sm mb-4">
                      {eventData.description}
                    </p>
                  </div>

                  <div className="space-y-3">
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
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Price per child
                      </p>
                      <p className="font-medium">{eventData.price}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-muted-foreground">Children</p>
                      <p className="font-medium">{children.length}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-lg font-bold">
                      <p>Total</p>
                      <p>
                        $
                        {parseInt(eventData.price.replace("$", "")) *
                          children.length}
                      </p>
                    </div>
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

export default RegistrationForm;
