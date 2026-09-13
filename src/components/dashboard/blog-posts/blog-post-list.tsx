/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  PlusCircle,
  Newspaper,
  Pencil,
  Trash2,
  CalendarIcon,
  GripVertical,
  ArrowUpToLine,
} from "lucide-react";
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
import { BlogPostForm } from "./blog-post-form";
import { TBlog } from "@/types/blog.type";
import { toast } from "sonner";
import { addBlog, deleteBlog, updateBlog } from "@/services/blogs";
import { reorderEntities } from "@/services/reorder";
import Image from "next/image";
import DOMPurify from "dompurify";
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

function SortableBlogCard({
  blog,
  onEdit,
  onDelete,
  onMoveToTop,
  sanitizeHtml,
}: {
  blog: TBlog;
  onEdit: (blog: TBlog) => void;
  onDelete: (id: string | undefined) => void;
  onMoveToTop: (id: string) => void;
  sanitizeHtml: (html: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: blog.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <button
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-white bg-black/50 rounded-md p-1 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {blog.blog_image ? (
          <Image
            width={500}
            height={500}
            src={
              typeof blog?.blog_image === "string"
                ? blog?.blog_image
                : URL.createObjectURL(blog?.blog_image)
            }
            alt={blog?.title || "Blog Image"}
            className="h-full w-full object-fill"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <Newspaper className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 flex-wrap">
            <span
              className={`px-2 py-1 text-xs rounded-full uppercase font-medium ${
                blog.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800"
                  : blog.status === "DRAFT"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {blog.status}
            </span>
            {blog.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-secondary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {new Date(blog.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h3 className="font-semibold text-lg line-clamp-2">{blog.title}</h3>
        <div
          className="text-sm line-clamp-3 prose prose-sm prose-headings:font-medium prose-a:text-blue-600 max-w-none"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(blog.short_description),
          }}
        />

        {blog.video_url && (
          <p className="text-xs text-muted-foreground mt-2">
            📹 Has video attachment
          </p>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveToTop(blog.id!)}
            title="Move to top"
          >
            <ArrowUpToLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(blog)}
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
                <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this blog post? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(blog.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}

export default function BlogPostList({ blogs: initialBlogs }: { blogs: TBlog[] }) {
  const [blogs, setBlogs] = useState<TBlog[]>(initialBlogs);
  const [postToEdit, setPostToEdit] = useState<TBlog | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreatePost = async (values: Partial<TBlog>) => {
    const { blog_image, ...rest } = values;
    const formData = new FormData();
    formData.append("data", JSON.stringify(rest));
    if (blog_image instanceof File) {
      formData.append("file", blog_image);
    }

    try {
      const result = await addBlog(formData);
      if (result.success) {
        toast.success("Blog post added successfully");
        setIsFormOpen(false);
      } else {
        toast.error(result.message || "Failed to add blog post");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add blog post");
    }
  };

  const handleUpdatePost = async (updatedPostData: Partial<TBlog>) => {
    const { blog_image, ...rest } = updatedPostData;
    const formData = new FormData();
    formData.append("data", JSON.stringify(rest));
    if (blog_image instanceof File) {
      formData.append("file", blog_image);
    }

    try {
      const result = await updateBlog(formData);
      if (result.success) {
        toast.success("Blog post updated successfully");
        setIsFormOpen(false);
        setPostToEdit(null);
      } else {
        toast.error(result.message || "Failed to update blog post");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update blog post");
    }
  };

  const handleDeletePost = async (id: string | undefined) => {
    if (!id) return;

    try {
      const result = await deleteBlog(id);
      if (result.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        toast.success("Blog post deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete blog post");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete blog post");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blogs.findIndex((b) => b.id === active.id);
    const newIndex = blogs.findIndex((b) => b.id === over.id);
    const newBlogs = arrayMove(blogs, oldIndex, newIndex);
    setBlogs(newBlogs);

    try {
      const res = await reorderEntities("blog", newBlogs.map((b) => b.id!));
      if (res.success) {
        toast.success("Blog order updated");
      }
    } catch {
      toast.error("Failed to update order");
      setBlogs(blogs);
    }
  };

  const handleMoveToTop = async (id: string) => {
    const index = blogs.findIndex((b) => b.id === id);
    if (index <= 0) return;

    const newBlogs = arrayMove(blogs, index, 0);
    setBlogs(newBlogs);

    try {
      const res = await reorderEntities("blog", newBlogs.map((b) => b.id!));
      if (res.success) {
        toast.success("Moved to top");
      }
    } catch {
      toast.error("Failed to update order");
      setBlogs(blogs);
    }
  };

  const openEditForm = (post: TBlog) => {
    setPostToEdit({
      ...post,
      blog_image: post.blog_image || "",
      tags: post.tags || [],
    });
    setIsFormOpen(true);
  };

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="destructive"
          className="text-white"
          onClick={() => {
            setPostToEdit(null);
            setIsFormOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {blogs?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <Newspaper className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No blog posts yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Create your first blog post to share your thoughts and ideas
              </p>
            </div>
            <Button
              variant={"destructive"}
              className="text-white"
              onClick={() => {
                setPostToEdit(null);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Blog Post
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
            items={blogs.filter((b) => b.id).map((b) => b.id!)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs?.map((blog) => (
                <SortableBlogCard
                  key={blog.id}
                  blog={blog}
                  onEdit={openEditForm}
                  onDelete={handleDeletePost}
                  onMoveToTop={handleMoveToTop}
                  sanitizeHtml={sanitizeHtml}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <BlogPostForm
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPostToEdit(null);
          }
          setIsFormOpen(open);
        }}
        post={postToEdit}
        onSubmit={postToEdit ? handleUpdatePost : handleCreatePost}
      />
    </div>
  );
}
