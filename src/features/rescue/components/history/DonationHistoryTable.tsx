"use client";

import { Badge } from "@/components/ui/badge";
import type { DonationRecord } from "@/types/donation";

interface DonationHistoryTableProps {
  records: DonationRecord[];
}

export function DonationHistoryTable({ records }: DonationHistoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="p-3 font-medium" scope="col">
              Item
            </th>
            <th className="p-3 font-medium" scope="col">
              Recipient
            </th>
            <th className="p-3 font-medium" scope="col">
              Status
            </th>
            <th className="p-3 font-medium" scope="col">
              Meals
            </th>
            <th className="p-3 font-medium" scope="col">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b last:border-0">
              <td className="p-3">
                <p className="font-medium">{record.item}</p>
                <p className="text-xs text-muted-foreground">{record.quantity}</p>
              </td>
              <td className="p-3">{record.recipientName}</td>
              <td className="p-3">
                <Badge
                  variant={record.status === "completed" ? "default" : "destructive"}
                >
                  {record.status}
                </Badge>
                {record.failureReason && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {record.failureReason}
                  </p>
                )}
              </td>
              <td className="p-3">{record.mealsRescued}</td>
              <td className="p-3 text-muted-foreground">
                {new Date(record.completedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
