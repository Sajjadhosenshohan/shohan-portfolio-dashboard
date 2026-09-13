/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export const reorderEntities = async (
  entity: "resume" | "project" | "blog" | "skill",
  orderedIds: string[]
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/reorder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: (await cookies()).get("accessToken")?.value || "",
        },
        body: JSON.stringify({ entity, orderedIds }),
      }
    );

    // Revalidate the relevant tag
    const tagMap: Record<string, string> = {
      resume: "resume",
      project: "projects",
      blog: "blogs",
      skill: "skills",
    };
    revalidateTag(tagMap[entity]);

    const result = await res.json();
    return result;
  } catch (error: any) {
    return Error(error);
  }
};
