"use client";

import Link from "next/link";
import { Leaf, Upload, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyOrgDashboard() {
  return (
    <div className="space-y-8">
      <EmptyState
        icon={Leaf}
        title="Welcome to Project Harvest"
        description="Your organization is ready. Upload operational data to unlock forecasts, recommendations, and impact insights."
        actionLabel="Upload your first file"
        onAction={() => {
          window.location.href = "/uploads";
        }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-primary" />
              Step 1: Upload data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add receipts, attendance records, inventory logs, or spreadsheets.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Step 2: Review insights
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            AI extracts patterns and generates waste forecasts automatically.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="h-4 w-4 text-primary" />
              Step 3: Take action
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Follow recommendations to prevent waste and rescue surplus food.
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need help getting started?{" "}
        <Link href="/assistant" className="text-primary hover:underline">
          Ask the AI Assistant
        </Link>
      </p>
    </div>
  );
}
