"use client";

import { useEffect } from "react";
import { hydrateMockData } from "@/lib/demo/hydrate-mock-data";

export function MockDataBootstrap() {
  useEffect(() => {
    hydrateMockData();
  }, []);

  return null;
}
