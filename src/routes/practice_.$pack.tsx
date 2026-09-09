import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { QuizPlayer } from "@/components/quiz-player";
import { Button } from "@/components/ui/button";
import { PACK_META, QUIZ_PACKS } from "@/lib/quiz";
import { SHAPES, type ShapeId } from "@/lib/shapes";

export const Route = createFileRoute("/practice_/$pack")({ component: PracticePack });

function PracticePack() {
  const { pack } = Route.useParams();
  const named = (QUIZ_PACKS as readonly string[]).includes(pack)
    ? PACK_META[pack as keyof typeof PACK_META]
    : pack in SHAPES
      ? { title: `${SHAPES[pack as ShapeId].name}通關`, blurb: "" }
      : { title: "挑戰", blurb: "" };

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/practice">
          <ArrowLeft className="size-4" />
          挑戰廣場
        </Link>
      </Button>
      <h1 className="mb-6 font-display text-2xl font-semibold">{named.title}</h1>
      <QuizPlayer pack={pack} />
    </AppShell>
  );
}
