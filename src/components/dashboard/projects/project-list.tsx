/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  PlusCircle,
  FolderKanban,
  Pencil,
  Trash2,
  ExternalLink,
  GripVertical,
  ArrowUpToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProjectForm } from "./project-form";
import Image from "next/image";
import { TProject } from "@/types/project.type";
import { useUser } from "@/context/UserContext";
import { handleEntityAction } from "@/utils/handleEntityAction";
import { reorderEntities } from "@/services/reorder";
import { toast } from "sonner";
import { deleteProject } from "@/services/project";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableProjectCard({
  project,
  onEdit,
  onDelete,
  onMoveToTop,
}: {
  project: TProject;
  onEdit: (project: TProject) => void;
  onDelete: (id: string) => void;
  onMoveToTop: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <div className="aspect-video w-full relative">
        <button
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-white bg-black/50 rounded-md p-1 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {project?.project_image ? (
          <Image
            src={project?.project_image || ""}
            alt={project?.title || ""}
            width={600}
            height={400}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <FolderKanban className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{project?.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {project?.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Technologies:</h4>
            <div className="flex flex-wrap gap-1">
              {project.technologies.map((tech, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary rounded-full"
                >
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <div className="flex-1 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveToTop(project.id)}
            title="Move to top"
          >
            <ArrowUpToLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(project)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 text-white"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive !text-white text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(project?.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {project?.live_link && (
          <Button size="icon" variant="ghost" asChild>
            <a
              href={project?.live_link}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ProjectList({
  AllProject: initialProjects,
}: {
  AllProject: TProject[];
}) {
  const [projects, setProjects] = useState<TProject[]>(initialProjects);
  const [projectToEdit, setProjectToEdit] = useState<TProject | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateProject = (formData: FormData) => {
    handleEntityAction("project", "create", formData, setLoading);
  };

  const handleUpdateProject = (formData: FormData) => {
    handleEntityAction("project", "update", formData, setLoading);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await deleteProject(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success(res?.message || "Project deleted successfully");
        setIsFormOpen(false);
      } else {
        toast.error(res?.message || "Failed to delete project");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const newProjects = arrayMove(projects, oldIndex, newIndex);
    setProjects(newProjects);

    try {
      const res = await reorderEntities("project", newProjects.map((p) => p.id));
      if (res.success) {
        toast.success("Project order updated");
      }
    } catch {
      toast.error("Failed to update order");
      setProjects(projects);
    }
  };

  const handleMoveToTop = async (id: string) => {
    const index = projects.findIndex((p) => p.id === id);
    if (index <= 0) return;

    const newProjects = arrayMove(projects, index, 0);
    setProjects(newProjects);

    try {
      const res = await reorderEntities("project", newProjects.map((p) => p.id));
      if (res.success) {
        toast.success("Moved to top");
      }
    } catch {
      toast.error("Failed to update order");
      setProjects(projects);
    }
  };

  const openEditForm = (project: TProject) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="destructive"
          className="text-white"
          onClick={() => {
            setProjectToEdit(null);
            setIsFormOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {projects?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No projects added</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Add your first project to showcase your work on your portfolio
                site
              </p>
            </div>
            <Button
              variant="destructive"
              className="text-white"
              onClick={() => {
                setProjectToEdit(null);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects?.map((project: TProject) => (
                <SortableProjectCard
                  key={project?.id}
                  project={project}
                  onEdit={openEditForm}
                  onDelete={handleDeleteProject}
                  onMoveToTop={handleMoveToTop}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        project={projectToEdit}
        onSubmit={projectToEdit ? handleUpdateProject : handleCreateProject}
        loading={loading}
        user={user}
      />
    </div>
  );
}