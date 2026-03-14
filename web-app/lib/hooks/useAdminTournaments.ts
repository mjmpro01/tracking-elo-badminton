"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLatestTournament } from "../api/admin/dashboard";

export function useLatestTournament() {
  return useQuery({
    queryKey: ["admin", "tournaments", "latest"],
    queryFn: () => fetchLatestTournament(),
  });
}
