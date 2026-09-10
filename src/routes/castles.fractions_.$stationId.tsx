"use client";

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/app-shell";
import { FractionStationView } from "@/components/fractions/stations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FRACTION_STATIONS, isFractionStationId } from "@/lib/fractions";

export const Route = createFileRoute("/castles/fractions_/$stationId")({
  component: FractionStationPage,
});

function FractionStationPage() {
  const { stationId } = Route.useParams();
  if (!isFractionStationId(stationId)) throw notFound();
  const meta = FRACTION_STATIONS.find((s) => s.id === stationId)!;

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="sun">分數城堡</Badge>
        <Badge variant="outline">{meta.emoji} {meta.name}</Badge>
        <Button asChild variant="ghost" size="sm">
          <Link to="/castles/fractions">全部車站</Link>
        </Button>
      </div>
      <PageTitle title={meta.name} subtitle={meta.blurb} />
      <FractionStationView stationId={stationId} />
    </AppShell>
  );
}
