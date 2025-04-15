import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Child } from "@/types/models";

// Form schema definition
const formSchema = z
  .object({
    selectedExistingChildIds: z.array(z.string()).optional(),
    children: z
      .array(
        z.object({
          id: z.string().optional(),
          firstName: z.string().min(2, { message: "First name is required" }),
          lastName: z.string().min(2, { message: "Last name is required" }),
          age: z
            .string()
            .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
              message: "Please enter a valid age",
            }),
        }),
      )
      .optional(),
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
      // Ensure at least one child is selected or added
      const hasExistingChildren =
        data.selectedExistingChildIds &&
        data.selectedExistingChildIds.length > 0;
      const hasNewChildren = data.children && data.children.length > 0;
      return hasExistingChildren || hasNewChildren;
    },
    {
      message: "At least one child must be registered",
      path: ["children"],
    },
  );

export type RegistrationFormValues = z.infer<typeof formSchema>;

export const useRegistrationForm = (existingChildren: Child[] = []) => {
  const [children, setChildren] = useState([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedExistingChildIds: [],
      children: [
        {
          firstName: "",
          lastName: "",
          age: "",
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
    const currentChildren = form.getValues().children || [];
    form.setValue("children", [
      ...currentChildren,
      {
        firstName: "",
        lastName: "",
        age: "",
      },
    ]);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      const newChildren = [...children];
      newChildren.splice(index, 1);
      setChildren(newChildren);

      const currentChildren = form.getValues().children || [];
      currentChildren.splice(index, 1);
      form.setValue("children", currentChildren);
    }
  };

  return {
    form,
    children,
    isSubmitting,
    submitError,
    submitSuccess,
    setIsSubmitting,
    setSubmitError,
    setSubmitSuccess,
    addChild,
    removeChild,
    existingChildren,
  };
};
