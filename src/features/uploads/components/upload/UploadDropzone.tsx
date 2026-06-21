"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCEPTED_FILE_TYPES } from "@/features/uploads/config/upload-stages";
import { useUploadFile } from "@/features/uploads/hooks/useUploads";
import { useOrgSites } from "@/features/organizations/hooks/useOrgSites";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  orgId: string;
  onUploadSuccess?: (uploadId: string) => void;
}

export function UploadDropzone({ orgId, onUploadSuccess }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState("");
  const { siteOptions, defaultSiteId } = useOrgSites(orgId);
  const [siteId, setSiteId] = useState("");
  const effectiveSiteId = siteId || defaultSiteId;
  const uploadMutation = useUploadFile(orgId);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = files[0];
      if (!file) return;
      if (!effectiveSiteId) {
        toast.error("No site available. Add a site to your organization first.");
        return;
      }

      try {
        const result = await uploadMutation.mutateAsync({
          file,
          siteId: effectiveSiteId,
          description: description || undefined,
        });
        toast.success(`${file.name} uploaded successfully`);
        setDescription("");
        onUploadSuccess?.(result.uploadId);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    },
    [uploadMutation, description, onUploadSuccess, effectiveSiteId],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        void handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload operational data</CardTitle>
        <CardDescription>
          Receipts, inventory logs, attendance records, waste reports, and more.
          Supported formats: PDF, CSV, XLSX, DOCX, TXT, images, ZIP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload files by dragging and dropping or pressing Enter to browse"
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            isDragging
              ? "border-primary bg-[var(--color-primary-soft)]"
              : "border-muted-foreground/25 hover:border-primary/50",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <Upload className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">Drag and drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">or</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            disabled={uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            <FileUp className="mr-2 h-4 w-4" aria-hidden />
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={ACCEPTED_FILE_TYPES}
            onChange={(e) => {
              if (e.target.files?.length) {
                void handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="upload-site">Site</Label>
          <Select value={effectiveSiteId} onValueChange={setSiteId}>
            <SelectTrigger id="upload-site" aria-label="Select site">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {siteOptions
                .filter((s) => s.value !== "all")
                .map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="upload-description">Description (optional)</Label>
          <Input
            id="upload-description"
            placeholder="e.g. March inventory count"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {uploadMutation.isPending && (
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Uploading file…
          </p>
        )}
      </CardContent>
    </Card>
  );
}
