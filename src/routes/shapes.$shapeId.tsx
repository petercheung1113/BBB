import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LessonView } from "@/components/lesson-view";
import { SHAPES, SHAPE_IDS, type ShapeId } from "@/lib/shapes";

export const Route = createFileRoute("/shapes/$shapeId")({
  component: ShapeLesson,
});

function isShapeId(id: string): id is ShapeId {
  return (SHAPE_IDS as readonly string[]).includes(id);
}

function ShapeLesson() {
  const { shapeId } = Route.useParams();
  if (!isShapeId(shapeId)) {
    return (
      <AppShell>
        <p className="text-ink-soft">找不到這座島。</p>
        <Link to="/" className="text-coral">
          返回王國
        </Link>
      </AppShell>
    );
  }
  const shape = SHAPES[shapeId];
  if (!shape) throw notFound();
  return (
    <AppShell>
      <LessonView shape={shape} />
    </AppShell>
  );
}
