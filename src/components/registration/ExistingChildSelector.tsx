import { Child } from "@/types/models";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  useController,
} from "react-hook-form";

interface ExistingChildSelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  existingChildren: Child[];
  loading: boolean;
  error: Error | null;
}

const ExistingChildSelector = <T extends FieldValues>({
  control,
  name,
  existingChildren,
  loading,
  error,
}: ExistingChildSelectorProps<T>) => {
  const { field } = useController({
    name,
    control,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading your children...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load your children. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (existingChildren.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Children Found</AlertTitle>
        <AlertDescription>
          You don't have any children added to your profile yet. Please add a
          new child below.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <FormItem>
      <div className="space-y-3 p-1">
        {existingChildren.map((child) => (
          <Card
            key={child.id}
            className={`border-2 ${
              field.value?.includes(child.id)
                ? "border-primary"
                : "border-border"
            }`}
          >
            <CardContent className="p-4 flex items-center space-x-4">
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(child.id)}
                    onCheckedChange={(checked) => {
                      const currentValue = field.value || [];
                      if (checked) {
                        field.onChange([...currentValue, child.id]);
                      } else {
                        field.onChange(
                          currentValue.filter((id) => id !== child.id)
                        );
                      }
                    }}
                  />
                </FormControl>
                <div>
                  <p className="font-medium">
                    {child.firstName} {child.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Age: {child.age}
                  </p>
                </div>
              </FormItem>
            </CardContent>
          </Card>
        ))}
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default ExistingChildSelector;
