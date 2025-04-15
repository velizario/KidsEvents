import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Control, FieldValues, UseFormReturn } from "react-hook-form";

interface ChildItem {
  id: number;
}

interface NewChildFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  children: ChildItem[];
  addChild: () => void;
  removeChild: (index: number) => void;
}

const NewChildForm = <T extends FieldValues>({
  form,
  children,
  addChild,
  removeChild,
}: NewChildFormProps<T>) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Add New Children</h3>
        <Button type="button" variant="outline" size="sm" onClick={addChild}>
          <Plus className="h-4 w-4 mr-2" />
          Add Another Child
        </Button>
      </div>

      <div className="max-h-80 overflow-y-auto p-1">
        {children.map((child, index) => (
          <Card key={child.id} className="mb-4">
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
                        <Input type="number" placeholder="8" {...field} />
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
    </div>
  );
};

export default NewChildForm;
