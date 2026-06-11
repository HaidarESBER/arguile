"use client";

import { useTransition } from "react";

type DeleteButtonProps = {
  id: string;
  name: string;
  onDelete: (formData: FormData) => Promise<void>;
};

export function DeleteButton({ id, name, onDelete }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(() => onDelete(formData));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
    >
      {isPending ? "…" : "Supprimer"}
    </button>
  );
}
