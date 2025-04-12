import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form schema definition
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
      })
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

export type RegistrationFormValues = z.infer<typeof formSchema>;

export const useRegistrationForm = () => {
  const [children, setChildren] = useState([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
  };
};
