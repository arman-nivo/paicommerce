import { Badge } from "@pai/ui";

export type PostStatus = "published" | "scheduled" | "draft";

export function postStatus(published: boolean, publishedAt: Date | string | null | undefined): PostStatus {
  if (!published) return "draft";
  if (publishedAt && new Date(publishedAt).getTime() > Date.now()) return "scheduled";
  return "published";
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  if (status === "published") return <Badge tone="green" dot>Published</Badge>;
  if (status === "scheduled") return <Badge tone="blue" dot>Scheduled</Badge>;
  return <Badge dot>Draft</Badge>;
}
