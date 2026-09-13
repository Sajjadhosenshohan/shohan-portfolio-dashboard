export type TBlog = {
  id?: string;
  title: string;
  short_description: string;
  blog_image: string | File; // or just string if you only store URLs
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishDate?: string;
  tags: string[];
  video_url?: string;
  sortOrder?: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};
