"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";
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
import { ImageUpload } from "../shared/image-upload";
import JoditEditor from "jodit-react";
import { TBlog } from "@/types/blog.type";

interface BlogPostFormValues {
  id?: string;
  title: string;
  short_description: string;
  blog_image: string | File;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  video_url?: string;
}

interface BlogPostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: TBlog | null;
  onSubmit: (values: BlogPostFormValues & { id?: string }) => Promise<void>;
}

export function BlogPostForm({
  open,
  onOpenChange,
  post,
  onSubmit,
}: BlogPostFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);

  const defaultValues: BlogPostFormValues = useMemo(() => ({
    title: post?.title || "",
    short_description: post?.short_description || "",
    blog_image: post?.blog_image || "",
    status: post?.status || "DRAFT",
    tags: post?.tags || [],
    video_url: post?.video_url || "",
  }), [post]);

  const form = useForm<BlogPostFormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [post, form, defaultValues]);

  const joditConfig = useMemo(() => ({
    readonly: false,
    placeholder: "Write your blog post content here...",
    height: 300,
  }), []);

  const addTag = () => {
    if (tagInput.trim() && !form.getValues("tags").includes(tagInput.trim())) {
      form.setValue("tags", [...form.getValues("tags"), tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      form.getValues("tags").filter((tag) => tag !== tagToRemove)
    );
  };

  const handleFormSubmit = async (values: BlogPostFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        id: post?.id,
      });
      if (!post) {
        form.reset(defaultValues);
        setTagInput("");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (file: File | string) => {
    form.setValue("blog_image", file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {post ? "Edit Blog Post" : "Create New Blog Post"}
          </DialogTitle>
          <DialogDescription>
            {post
              ? "Update your blog post content and settings."
              : "Create a new blog post for your portfolio."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <JoditEditor
                      ref={editorRef}
                      value={field.value}
                      config={joditConfig}
                      onBlur={(newContent) => field.onChange(newContent)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="blog_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onChange={handleImageChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addTag}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.watch("tags").map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-muted-foreground hover:text-foreground"
                              aria-label={`Remove ${tag} tag`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com/watch?v=... or video URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  onOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive"
                disabled={isSubmitting} className="text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {post ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  post ? "Update Post" : "Create Post"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}