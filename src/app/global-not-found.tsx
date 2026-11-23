import { PageDocument, PageMain } from "@/components/PageDocument";
import { notFoundPage } from "@/lib/pages";

/** The live site's 404 page, for every unknown address. */
export default function GlobalNotFound() {
  const page = notFoundPage();
  return (
    <PageDocument page={page}>
      <PageMain page={page} />
    </PageDocument>
  );
}
