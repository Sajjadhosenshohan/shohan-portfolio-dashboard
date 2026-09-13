/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { PlusCircle, Wrench, Trash2, GripVertical, ArrowUpToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { SkillForm, SkillFormValues } from "./skill-form";
import { TSkill } from "@/types/skill.type";
import { addSkill, deleteSkill } from "@/services/skills";
import { reorderEntities } from "@/services/reorder";
import { toast } from "sonner";
import Image from "next/image";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableSkillCard({
  skill,
  onDelete,
  onMoveToTop,
}: {
  skill: TSkill;
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
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            {skill.image ? (
              <Image
                width={100}
                height={100}
                src={skill?.image}
                alt={skill?.name}
                className="h-12 w-12 object-cover rounded-md"
              />
            ) : (
              <div className="h-12 w-12 bg-secondary rounded-md flex items-center justify-center">
                <Wrench className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-medium">{skill.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {skill.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveToTop(skill.id)}
              title="Move to top"
            >
              <ArrowUpToLine className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the skill &quot;{skill.name}
                    &quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive !text-white text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(skill?.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SkillList({ skills: initialSkills }: { skills: TSkill[] }) {
  const [skills, setSkills] = useState<TSkill[]>(initialSkills);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateSkill = async (values: SkillFormValues) => {
    const formData = new FormData();
    const data = {
      name: values.name,
      category: values.category,
    };
    formData.append("data", JSON.stringify(data));
    if (values.image) {
      formData.append("file", values.image);
    }

    try {
      const res = await addSkill(formData);
      if (res.success) {
        toast.success(res?.message || `Skill added successfully`);
        setIsFormOpen?.(false);
      } else {
        toast.error(res?.message || `Failed to add skill`);
      }
    } catch (error: any) {
      console.log(error.message || "Failed to add skill");
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const res = await deleteSkill(skillId);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s.id !== skillId));
        toast.success(res?.message || `Skill deleted successfully`);
      } else {
        toast.error(res?.message || `Failed delete skill`);
      }
    } catch (error: any) {
      console.log(error.message || "Failed delete skill");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = skills.findIndex((s) => s.id === active.id);
    const newIndex = skills.findIndex((s) => s.id === over.id);
    const newSkills = arrayMove(skills, oldIndex, newIndex);
    setSkills(newSkills);

    try {
      const res = await reorderEntities("skill", newSkills.map((s) => s.id));
      if (res.success) {
        toast.success("Skill order updated");
      }
    } catch {
      toast.error("Failed to update order");
      setSkills(skills); // revert
    }
  };

  const handleMoveToTop = async (id: string) => {
    const index = skills.findIndex((s) => s.id === id);
    if (index <= 0) return;

    const newSkills = arrayMove(skills, index, 0);
    setSkills(newSkills);

    try {
      const res = await reorderEntities("skill", newSkills.map((s) => s.id));
      if (res.success) {
        toast.success("Moved to top");
      }
    } catch {
      toast.error("Failed to update order");
      setSkills(skills);
    }
  };

  // Group skills by category for display
  const groupedSkills = skills.reduce((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, TSkill[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Your Skills</h2>
        <Button
          variant="destructive"
          className="text-white"
          onClick={() => {
            setIsFormOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <Wrench className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No skills added</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Add your first skill to showcase your expertise.
              </p>
            </div>
            <Button
              variant="destructive"
              className="text-white"
              onClick={() => {
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">
                {category} ({categorySkills.length})
              </h3>
              <SortableContext
                items={categorySkills.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => (
                    <SortableSkillCard
                      key={skill.id}
                      skill={skill}
                      onDelete={handleDeleteSkill}
                      onMoveToTop={handleMoveToTop}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </DndContext>
      )}

      <SkillForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateSkill}
      />
    </div>
  );
}
