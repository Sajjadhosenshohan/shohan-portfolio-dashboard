"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/dashboard/shared/image-upload";

// Define the schema for form values
const skillSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  image: z.instanceof(File).nullable().optional(), // Expects a File object or null/undefined
});

export type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SkillFormValues) => void;
  initialData?: Partial<SkillFormValues & { imageUrl?: string | null }>;
}

const predefinedCategories = [
  "Backend & Core",
  "Database & ORM",
  "Automation & Integrations",
  "AI / LLM",
  "Deploy & Infra",
  "Frontend",
  "Tools",
];

export function SkillForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: SkillFormProps) {
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      image: null,
    },
  });

  const handleFormSubmit = (values: SkillFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          form.reset();
          setUseCustomCategory(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.name ? "Edit Skill" : "Add New Skill"}
          </DialogTitle>
          <DialogDescription>
            {initialData?.name
              ? "Update the details of your skill."
              : "Add a new skill to showcase in your portfolio."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input placeholder="React" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  {!useCustomCategory ? (
                    <>
                      <Select
                        onValueChange={(value) => {
                          if (value === "__custom__") {
                            setUseCustomCategory(true);
                            field.onChange("");
                          } else {
                            field.onChange(value);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {predefinedCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">
                            ✏️ Custom Category...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Type custom category"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUseCustomCategory(false);
                          field.onChange("");
                        }}
                      >
                        ← Back
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Icon</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={initialData?.imageUrl || null}
                      onChange={(file: File) => {
                        field.onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                  setUseCustomCategory(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="text-white"
                type="submit"
              >
                {initialData?.name ? "Save Changes" : "Add Skill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
