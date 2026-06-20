"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadStageBadge } from "@/features/uploads/components/queue/UploadStageBadge";
import type { UploadSummary } from "@/types/upload";

interface UploadHistoryTableProps {
  uploads: UploadSummary[];
  onReview?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadHistoryTable({ uploads, onReview }: UploadHistoryTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">File</TableHead>
            <TableHead scope="col">Classification</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Confidence</TableHead>
            <TableHead scope="col">Date</TableHead>
            <TableHead scope="col">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.map((upload) => (
            <TableRow key={upload.id}>
              <TableCell>
                <p className="font-medium">{upload.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(upload.fileSize)}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {upload.classification.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <UploadStageBadge status={upload.status} />
                {upload.failureReason && (
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    {upload.failureReason}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {upload.confidence > 0
                  ? `${Math.round(upload.confidence * 100)}%`
                  : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(upload.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {upload.status === "review_required" && onReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReview(upload.id)}
                  >
                    Review
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
