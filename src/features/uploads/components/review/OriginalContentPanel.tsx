"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OriginalContentPanelProps {
  content: string;
  contentType: "text" | "image" | "table";
  fileName: string;
}

export function OriginalContentPanel({
  content,
  contentType,
  fileName,
}: OriginalContentPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Original content</CardTitle>
        <p className="text-xs text-muted-foreground">{fileName}</p>
      </CardHeader>
      <CardContent>
        {contentType === "image" ? (
          content.startsWith("http") || content.startsWith("/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content}
              alt={`Preview of ${fileName}`}
              className="max-h-64 w-full rounded-md object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Image preview unavailable. File: {fileName}
            </p>
          )
        ) : (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
            {content}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
