import { useQuery } from "@tanstack/react-query";
import {
  fetchMatchesForToday,
  fetchPendingReviewMatches,
} from "../api/matches";

export function useTodayMatches() {
  return useQuery({
    queryKey: ["matches", "today"],
    queryFn: () => fetchMatchesForToday(),
  });
}

export function usePendingReviewMatches() {
  return useQuery({
    queryKey: ["matches", "pending_review"],
    queryFn: () => fetchPendingReviewMatches(),
  });
}

