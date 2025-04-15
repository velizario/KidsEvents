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
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import ExistingChildSelector from "./ExistingChildSelector";
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
import { useParentData } from "@/hooks/useParentData";
import { registrationAPI } from "@/lib/api";
import { Event, Child } from "@/types/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Fetch parent's existing children
  const {
    children: existingChildren,
    loading: childrenLoading,
    error: childrenError,
    parentId,
  } = useParentData();

  const {
    form,
    isSubmitting,
    submitError,
    setIsSubmitting,
    setSubmitError,
    setSubmitSuccess,
    submitSuccess,
    existingChildren: formExistingChildren,
  } = useRegistrationForm(existingChildren);

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

      // Get the current authenticated user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting authenticated user:", userError);
        throw new Error(
          "Failed to get authenticated user: " + userError.message,
        );
      }

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
        console.error("Error checking for existing parent:", checkParentError);
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
            "Failed to create parent record: " + parentError.message,
          );
        }
        console.log("Created new parent record");
      } else {
        console.log("Parent record already exists, skipping creation");
      }

      // Get selected existing children
      const childrenToRegister = [];

      // Process existing children selections
      if (
        data.selectedExistingChildIds &&
        data.selectedExistingChildIds.length > 0
      ) {
        childrenToRegister.push(...data.selectedExistingChildIds);
      }

      // Register all children for the event
      try {
        for (const childId of childrenToRegister) {
          const registration = await registrationAPI.registerForEvent(
            eventId || mockEvent?.id || "",
            {
              childId,
              parentId: actualParentId,
              emergencyContact: data.emergencyContact,
              paymentMethod: data.paymentMethod,
            },
          );
          console.log(
            "Registration successful for child ID:",
            childId,
            registration,
          );
        }
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
          : new Error("Failed to complete registration"),
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
                  </div>

                  {/* Combined child selection and creation */}
                  <div className="space-y-6">
                    {/* Children Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Select Children</h3>
                      <FormField
                        control={form.control}
                        name="selectedExistingChildIds"
                        render={() => (
                          <ExistingChildSelector
                            control={form.control}
                            name="selectedExistingChildIds"
                            existingChildren={existingChildren}
                            loading={childrenLoading}
                            error={childrenError}
                          />
                        )}
                      />
                    </div>
                  </div>
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
                        <p className="font-medium">
                          {(form.getValues().selectedExistingChildIds?.length ||
                            0) + (form.getValues().children?.length || 0)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-lg font-bold">
                        <p>Total</p>
                        <p>
                          $
                          {parseInt(event.price?.replace("$", "") || "0") *
                            ((form.getValues().selectedExistingChildIds
                              ?.length || 0) +
                              (form.getValues().children?.length || 0))}
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
