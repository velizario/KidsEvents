import {
  useParams as useRouterParams,
  Link,
  useNavigate as useRouterNavigate,
} from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { parentAPI } from "@/lib/api";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { useEvents } from "@/hooks/useEvents";
import { registrationAPI } from "@/lib/api";
import { Event } from "@/types/models";

interface RegistrationFormProps {
  useParamsHook?: typeof useRouterParams;
  useNavigateHook?: typeof useRouterNavigate;
  mockEvent?: Event; // Add mockEvent prop for storyboards
}

const RegistrationForm = ({
  useParamsHook = useRouterParams,
  useNavigateHook = useRouterNavigate,
  mockEvent = null,
}: RegistrationFormProps) => {
  const { eventId } = useParamsHook<{ eventId: string }>();
  const navigate = useNavigateHook();
  const {
    form,
    children,
    addChild,
    removeChild,
    isSubmitting,
    submitError,
    setIsSubmitting,
    setSubmitError,
    setSubmitSuccess,
    submitSuccess,
  } = useRegistrationForm();

  const {
    event: fetchedEvent,
    loading: eventLoading,
    error: eventError,
    fetchEvent,
  } = useEvents();

  // Use mockEvent if provided, otherwise use fetchedEvent
  const [event, setEvent] = useState<Event | null>(mockEvent);

  // Fetch event data when component mounts
  useEffect(() => {
    if (mockEvent) {
      setEvent(mockEvent);
      return;
    }

    if (eventId) {
      fetchEvent(eventId).catch((error) => {
        console.error("Error fetching event:", error);
        setSubmitError(new Error("Failed to load event details"));
      });
    }
  }, [eventId, mockEvent]);

  // Update event when fetchedEvent changes
  useEffect(() => {
    if (!mockEvent && fetchedEvent) {
      setEvent(fetchedEvent);
    }
  }, [fetchedEvent, mockEvent]);

  const onSubmit = async (data: any) => {
    if (!eventId && !mockEvent) {
      setSubmitError(new Error("Event ID is missing"));
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      console.log("Registration submitted:", data);

      // Get the first child from the form data
      const childData = data.children[0];

      // Generate a valid UUID for the child ID
      // The parent ID will be fetched from the authenticated user
      const childId = crypto.randomUUID();

      // Register for the event
      try {
        // First create the child record with the form data
        const childFormData = data.children[0];

        // Create the child record using direct supabase call without select=*
        try {
          // Create a date of birth based on the age (approximate)
          const currentDate = new Date();
          const approximateBirthYear =
            currentDate.getFullYear() - parseInt(childFormData.age);
          const dateOfBirth = new Date(approximateBirthYear, 0, 1)
            .toISOString()
            .split("T")[0]; // January 1st of the birth year

          // Get the current authenticated user
          const { data: userData, error: userError } =
            await supabase.auth.getUser();

          if (userError) {
            console.error("Error getting authenticated user:", userError);
            throw new Error(
              "Failed to get authenticated user: " + userError.message
            );
          }

          const actualParentId = userData.user?.id;

          if (!actualParentId) {
            throw new Error("User is not authenticated");
          }

          const { error: childError } = await supabase.from("children").insert({
            id: childId,
            parent_id: actualParentId,
            first_name: childFormData.firstName,
            last_name: childFormData.lastName,
            age: parseInt(childFormData.age),
            date_of_birth: dateOfBirth, // Add the date_of_birth field
          });

          if (childError) {
            console.error("Error creating child record:", childError);
            throw new Error(
              "Failed to create child record: " + childError.message
            );
          }
        } catch (childError) {
          console.error("Error creating child record:", childError);
          throw new Error(
            "Failed to create child record: " +
              (childError instanceof Error
                ? childError.message
                : String(childError))
          );
        }

        // Get the current authenticated user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting authenticated user:", userError);
          throw new Error(
            "Failed to get authenticated user: " + userError.message
          );
        }

        // Use the actual user ID instead of a random UUID
        const actualParentId = userData.user?.id;

        if (!actualParentId) {
          throw new Error("User is not authenticated");
        }

        // Check if parent record already exists before creating it
        const { data: existingParent, error: checkParentError } = await supabase
          .from("parents")
          .select("id")
          .eq("id", actualParentId)
          .maybeSingle();

        if (checkParentError) {
          console.error(
            "Error checking for existing parent:",
            checkParentError
          );
        }

        // Only create parent record if it doesn't already exist
        if (!existingParent) {
          const { error: parentError } = await supabase.from("parents").insert({
            id: actualParentId,
            email: userData.user.email || "demo@example.com",
            first_name: "Demo",
            last_name: "Parent",
            phone: data.emergencyContact.phone || "555-123-4567",
          });

          if (parentError) {
            console.error("Error creating parent record:", parentError);
            throw new Error(
              "Failed to create parent record: " + parentError.message
            );
          }
          console.log("Created new parent record");
        } else {
          console.log("Parent record already exists, skipping creation");
        }

        // Now register for the event - use the already fetched user data

        const registration = await registrationAPI.registerForEvent(
          eventId || mockEvent?.id || "",
          {
            childId,
            parentId: actualParentId,
            emergencyContact: data.emergencyContact,
            paymentMethod: data.paymentMethod,
          }
        );
        console.log("Registration successful:", registration);
      } catch (registrationError) {
        console.error("Registration API error:", registrationError);
        throw registrationError;
      }

      setSubmitSuccess(true);

      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        navigate(`/events/${eventId || mockEvent?.id}/confirmation`);
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(
        error instanceof Error
          ? error
          : new Error("Failed to complete registration")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/events/${eventId || "mock-event-id"}`}>
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

                {submitSuccess && (
                  <Alert className="mb-4" variant="default">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Registration completed successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {submitError && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {submitError.message ||
                        "Failed to complete registration. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/events/${eventId || "mock-event-id"}`}>
                      Cancel
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || (eventLoading && !mockEvent) || !event
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Complete Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Event Summary */}
          <div>
            <div className="sticky top-20">
              {eventLoading && !mockEvent && !event && (
                <div className="flex items-center justify-center h-40">
                  <p>Loading event details...</p>
                </div>
              )}

              {eventError && !mockEvent && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load event details. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {event && (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        Event Summary
                      </h2>
                      <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                        <img
                          src={
                            event.imageUrl ||
                            "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80"
                          }
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-medium mb-1">
                        {event.title}
                      </h3>
                      <Badge className="mb-2">{event.category}</Badge>
                      <p className="text-muted-foreground text-sm mb-4">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{event.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-medium">{event.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="font-medium">{event.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Age Group
                          </p>
                          <p className="font-medium">{event.ageGroup}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          Price per child
                        </p>
                        <p className="font-medium">{event.price}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-muted-foreground">
                          Children
                        </p>
                        <p className="font-medium">{children.length}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-lg font-bold">
                        <p>Total</p>
                        <p>
                          $
                          {parseInt(event.price?.replace("$", "") || "0") *
                            children.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
