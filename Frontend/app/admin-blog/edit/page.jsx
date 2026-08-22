import { Suspense } from "react";
import EditBlogPageClient from "./EditBlogPageClient";

export default function EditBlogPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <EditBlogPageClient />
    </Suspense>
  );
}