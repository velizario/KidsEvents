import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Phone, Plus, Trash2, Loader2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
// Assuming Child type might be needed, adjust path if necessary
import { Child, Parent } from "@/types/models";

const childSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
});

const parentProfileSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  children: z.array(childSchema),
});

type ParentProfileFormValues = z.infer<typeof parentProfileSchema>;

const organizerProfileSchema = z.object({
  organizationName: z
    .string()
    .min(2, { message: "Organization name is required" }),
  contactName: z.string().min(2, { message: "Contact name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  description: z.string().min(10, { message: "Description is required" }),
  website: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || undefined),
});

type OrganizerProfileFormValues = z.infer<typeof organizerProfileSchema>;

interface ProfileFormProps {
  userType: "parent" | "organizer";
  initialData?: ParentProfileFormValues | OrganizerProfileFormValues;
  onSubmit?: (
    data: ParentProfileFormValues | OrganizerProfileFormValues
  ) => void;
}

const ProfileForm = ({
  userType = "parent",
  initialData,
  onSubmit,
}: ProfileFormProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const checkUser = useAuthStore((state) => state.checkUser);
  const { updateParentProfile, updateOrganizerProfile, loading, error } =
    useProfile();
  const { toast } = useToast();
  const [deletedChildrenIds, setDeletedChildrenIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parentForm = useForm<ParentProfileFormValues>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      children: [],
      ...(initialData as ParentProfileFormValues),
    },
  });

  const { fields, append, remove, prepend } = useFieldArray({
    control: parentForm.control,
    name: "children",
    keyName: "fieldId",
  });

  const organizerForm = useForm<OrganizerProfileFormValues>({
    resolver: zodResolver(organizerProfileSchema),
    defaultValues: {
      organizationName: "",
      contactName: "",
      email: "",
      phone: "",
      description: "",
      website: "",
      ...(initialData as OrganizerProfileFormValues),
    },
  });

  useEffect(() => {
    if (user && user.id) {
      if (userType === "parent") {
        const parentUser = user as Parent & { children?: Child[] };
        parentForm.reset({
          firstName: parentUser.firstName || "",
          lastName: parentUser.lastName || "",
          email: parentUser.email || "",
          phone: parentUser.phone || "",
          // Existing children are loaded in their current order. New children will be prepended.
          children:
            parentUser.children?.map((child) => ({
              id: child.id,
              firstName: child.firstName || "",
              lastName: child.lastName || "",
              dateOfBirth: child.dateOfBirth || "",
            })) || [],
        });
        setDeletedChildrenIds([]);
      } else {
        organizerForm.reset({
          organizationName: (user as any).organizationName || "",
          contactName: (user as any).contactName || "",
          email: user.email || "",
          phone: user.phone || "",
          description: (user as any).description || "",
          website: (user as any).website || "",
        });
      }
    }
  }, [user, userType, parentForm.reset, organizerForm.reset]);

  const addChild = () => {
    prepend({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    });
  };

  const removeChild = (index: number) => {
    const childToRemove = parentForm.getValues().children[index];

    if (childToRemove?.id) {
      setDeletedChildrenIds((prev) => [...prev, childToRemove.id!]);
    }
    remove(index);
  };

  const handleParentSubmit = async (data: ParentProfileFormValues) => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const childrenData = data.children.map((child) => ({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
        parentId: user.id,
      }));

      await updateParentProfile(
        user.id,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        childrenData,
        deletedChildrenIds.length > 0 ? deletedChildrenIds : undefined
      );

      setDeletedChildrenIds([]);

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });

      await checkUser({ forceProfileRefresh: true });

      if (onSubmit) onSubmit(data);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: `Failed to update profile. ${
          err instanceof Error ? err.message : "Please try again."
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrganizerSubmit = async (data: OrganizerProfileFormValues) => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrganizerProfile(user.id, {
        organizationName: data.organizationName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        description: data.description,
        website: data.website,
      });

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });

      await checkUser({ forceProfileRefresh: true });

      if (onSubmit) onSubmit(data);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {userType === "parent" ? "Parent Profile" : "Organizer Profile"}
        </h1>

        {userType === "parent" ? (
          <Form {...parentForm}>
            <form
              onSubmit={parentForm.handleSubmit(handleParentSubmit)}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                        alt="Sarah Johnson"
                      />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={parentForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Sarah" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={parentForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Johnson" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={parentForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="sarah.johnson@example.com"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={parentForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="(555) 123-4567"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Children Information</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addChild}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Child
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.fieldId}
                      className="border rounded-lg p-4 relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium pt-2">Child {index + 1}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChild(index)}
                          className="text-destructive absolute top-2 right-2"
                          aria-label={`Remove Child ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={parentForm.control}
                          name={`children.${index}.firstName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Emma" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={parentForm.control}
                          name={`children.${index}.lastName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Johnson" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={parentForm.control}
                          name={`children.${index}.dateOfBirth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* <input type="hidden" {...parentForm.register(`children.${index}.id`)} /> */}
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No children added yet. Click "Add Child" to add one.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...organizerForm}>
            <form
              onSubmit={organizerForm.handleSubmit(handleOrganizerSubmit)}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Organization Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Community"
                        alt="Community Arts Center"
                      />
                      <AvatarFallback>CAC</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow space-y-4">
                      <FormField
                        control={organizerForm.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Community Arts Center"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={organizerForm.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person</FormLabel>
                              <FormControl>
                                <Input placeholder="John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={organizerForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://www.example.com"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={organizerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="info@example.com"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={organizerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="(555) 123-4567"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={organizerForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your organization and the types of events you offer..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This description will be visible to parents Browse
                          your events.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
