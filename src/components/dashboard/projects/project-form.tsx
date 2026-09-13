/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "../shared/image-upload";
import { TProject, TTechnology } from "@/types/project.type";

type ProjectFormValues = {
  id?: string;
  title: string;
  description: string;
  features?: string[];
  project_image?: File | string | null;
  client_link?: string;
  server_link?: string;
  live_link?: string;
  video_url?: string;
  tags?: string[];
  technologies?: TTechnology[];
};

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: TProject | null;
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  user: any;
}

export function ProjectForm({
  open,
  onOpenChange,
  project,
  onSubmit,
  loading,
  user,
}: ProjectFormProps) {
  const [techInput, setTechInput] = useState("");
  const [techIconInput, setTechIconInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(
    project?.project_image || null
  );

  const form = useForm<ProjectFormValues>({
    defaultValues: {
      id: project?.id || "",
      title: project?.title || "",
      description: project?.description || "",
      features: project?.features || [],
      project_image: project?.project_image || null,
      client_link: project?.client_link || "",
      server_link: project?.server_link || "",
      live_link: project?.live_link || "",
      video_url: project?.video_url || "",
      tags: project?.tags || [],
      technologies: project?.technologies || [],
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        id: project.id || "",
        title: project.title || "",
        description: project.description || "",
        features: project.features || [],
        project_image: project.project_image || null,
        client_link: project.client_link || "",
        server_link: project.server_link || "",
        live_link: project.live_link || "",
        video_url: project.video_url || "",
        tags: project.tags || [],
        technologies: project.technologies || [],
      });
      setPreviewImage(project.project_image || null);
    } else {
      form.reset({
        id: "",
        title: "",
        description: "",
        features: [],
        project_image: null,
        client_link: "",
        server_link: "",
        live_link: "",
        video_url: "",
        tags: [],
        technologies: [],
      });
      setPreviewImage(null);
    }
  }, [project, form]);

  const handleImageUpload = (file: File) => {
    form.setValue("project_image", file);
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  };

  const addTechnology = () => {
    if (techInput.trim()) {
      const newTech: TTechnology = {
        name: techInput.trim(),
        icon: techIconInput.trim() || undefined,
      };
      form.setValue("technologies", [
        ...(form.getValues("technologies") || []),
        newTech,
      ]);
      setTechInput("");
      setTechIconInput("");
    }
  };

  const removeTechnology = (index: number) => {
    const currentTech = form.getValues("technologies") || [];
    form.setValue(
      "technologies",
      currentTech.filter((_, i) => i !== index)
    );
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      form.setValue("features", [
        ...(form.getValues("features") || []),
        featureInput.trim(),
      ]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !(form.getValues("tags") || []).includes(tagInput.trim())) {
      form.setValue("tags", [
        ...(form.getValues("tags") || []),
        tagInput.trim(),
      ]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (values: ProjectFormValues) => {
    const formData = new FormData();

    const data = {
      id: project?.id || "",
      title: values.title,
      authorId: user?.id,
      description: values.description,
      features: values.features || [],
      client_link: values.client_link || "",
      server_link: values.server_link || "",
      live_link: values.live_link || "",
      video_url: values.video_url || "",
      tags: values.tags || [],
      technologies: values.technologies || [],
    };
    formData.append("data", JSON.stringify(data));

    if (values.project_image instanceof File) {
      formData.append("file", values.project_image);
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Update your project details"
              : "Add a new project to your portfolio"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Amazing Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Features</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a project feature"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addFeature}>
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.watch("features")?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-secondary rounded-md"
                  >
                    <span className="text-sm">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="project_image"
              render={() => (
                <FormItem>
                  <FormLabel>Project Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={previewImage}
                      onChange={handleImageUpload}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="live_link"
              rules={{
                pattern: {
                  value: /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/i,
                  message: "Please enter a valid URL",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Project URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://myproject.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frontend Code URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/username/client"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="server_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backend Code URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/username/server"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Video URL (optional)</FormLabel>
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

            {/* Project Tags */}
            <div>
              <FormLabel>Project Tags</FormLabel>
              <p className="text-xs text-muted-foreground mb-2">
                e.g. Own Project, Team Project, Client Project
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag (e.g. Client Project)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch("tags")?.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Technologies</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  className="w-[80%]"
                  placeholder="Technology name (e.g., React)"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTechnology();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTechnology}
                  className="w-[20%] mb-2"
                >
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {form.watch("technologies")?.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-secondary rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{tech.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTechnology(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="text-white"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : project
                  ? "Update Project"
                  : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
