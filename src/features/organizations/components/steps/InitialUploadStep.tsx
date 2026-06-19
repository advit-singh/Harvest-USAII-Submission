"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InitialUploadStep() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-primary">
        <Upload className="h-8 w-8" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">Upload initial data (recommended)</h3>
      <p className="text-sm text-muted-foreground">
        Add receipts, attendance sheets, or inventory logs to start generating
        insights. You can also skip and upload later from the Uploads workspace.
      </p>
      <Button asChild variant="outline">
        <Link href="/uploads">Go to Uploads</Link>
      </Button>
    </div>
  );
}
