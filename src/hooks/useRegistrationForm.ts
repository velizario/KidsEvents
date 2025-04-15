import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Child } from "@/types/models";

// Form schema definition
const formSchema = z
  .object({
    selectedExistingChildIds: z
      .array(z.string())
      .min(1, { message: "At least one child must be selected" }),

    emergencyContact: z.object({
      name: z
        .string()
        .min(2, { message: "Emergency contact name is required" }),
      phone: z
        .string()
        .min(10, { message: "Please enter a valid phone number" }),
      relationship: z.string().min(2, { message: "Relationship is required" }),
    }),
    paymentMethod: z.enum(["credit", "paypal"]),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine(
    (data) => {
      // Ensure at least one child is selected
      const hasExistingChildren =
        data.selectedExistingChildIds &&
        data.selectedExistingChildIds.length > 0;
      return hasExistingChildren;
    },
    {
      message: "At least one child must be selected",
      path: ["selectedExistingChildIds"],
    },
  );

export type RegistrationFormValues = z.infer<typeof formSchema>;

export const useRegistrationForm = (existingChildren: Child[] = []) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedExistingChildIds: [],
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
      paymentMethod: "credit",
      termsAccepted: false,
    },
  });

  return {
    form,
    isSubmitting,
    submitError,
    submitSuccess,
    setIsSubmitting,
    setSubmitError,
    setSubmitSuccess,
    existingChildren,
  };
};
