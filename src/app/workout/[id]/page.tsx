"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WorkoutEditor } from "@/components/workout/WorkoutEditor";
import { useWorkoutStore } from "@/stores/workout.store";

function EditWorkoutContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();

  const hydrate = useWorkoutStore((s) => s.hydrate);
  const hydrated = useWorkoutStore((s) => s.hydrated);
  const getWorkoutById = useWorkoutStore((s) => s.getWorkoutById);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <span className="font-display text-2xl uppercase tracking-wider text-[#83FF36]">
          Carregando editor...
        </span>
      </div>
    );
  }

  const workout = getWorkoutById(id);

  if (!workout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0A] px-4 text-center text-white">
        <h1 className="font-display text-4xl uppercase">
          Treino não encontrado
        </h1>
        <Button onClick={() => router.push("/")}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return <WorkoutEditor initialWorkout={workout} mode="edit" />;
}

export default function EditWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
          <span className="font-display text-2xl uppercase tracking-wider text-[#83FF36]">
            Carregando editor...
          </span>
        </div>
      }
    >
      <EditWorkoutContent />
    </Suspense>
  );
}
