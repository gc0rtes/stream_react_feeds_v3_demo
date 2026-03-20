import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const TIMELINE_INTEREST_OPTIONS = [
  { id: "cats", label: "Cats" },
  { id: "chess", label: "Chess" },
  { id: "music", label: "Music" },
] as const;

export type TimelineInterestId = (typeof TIMELINE_INTEREST_OPTIONS)[number]["id"];

type TimelineInterestOnboardingProps = {
  open: boolean;
  onConfirm: (interestWeights: Record<string, number>) => void;
};

export function TimelineInterestOnboarding({
  open,
  onConfirm,
}: TimelineInterestOnboardingProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    const interest_weights: Record<string, number> = {};
    selected.forEach((id) => {
      interest_weights[id] = 1;
    });
    onConfirm(interest_weights);
    setSelected(new Set());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-1/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-interest-title"
    >
      <Card className="w-full max-w-md border-dark-4 bg-dark-3 text-light-1 shadow-xl">
        <CardHeader className="space-y-2 pb-2">
          <h2
            id="timeline-interest-title"
            className="h3-bold text-light-1"
          >
            Personalize your feed
          </h2>
          <p className="base-regular text-light-4">
            Your timeline is empty. Pick topics you care about so we can tune
            what you see first.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-2">
          <div className="flex flex-wrap gap-2">
            {TIMELINE_INTEREST_OPTIONS.map(({ id, label }) => {
              const isOn = selected.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isOn
                      ? "border-primary-500 bg-primary-500/15 text-light-1"
                      : "border-dark-4 bg-dark-4 text-light-3 hover:border-light-4 hover:text-light-2"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            className="w-full bg-primary-500 hover:bg-primary-500/90"
            disabled={selected.size === 0}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
