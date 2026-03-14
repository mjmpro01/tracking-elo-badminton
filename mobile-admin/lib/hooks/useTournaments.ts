import { useQuery } from "@tanstack/react-query";
import {
  fetchOngoingTournament,
  fetchLatestTournament,
  fetchTournamentById,
  fetchTournaments,
  TournamentStatus,
} from "../api/tournaments";

export function useTournaments(status?: TournamentStatus) {
  return useQuery({
    queryKey: ["tournaments", { status }],
    queryFn: () => fetchTournaments({ status }),
  });
}

export function useOngoingTournament() {
  return useQuery({
    queryKey: ["tournaments", "ongoing"],
    queryFn: () => fetchOngoingTournament(),
  });
}

export function useLatestTournament() {
  return useQuery({
    queryKey: ["tournaments", "latest"],
    queryFn: () => fetchLatestTournament(),
  });
}

export function useTournament(id?: string) {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Tournament id is required");
      }
      return fetchTournamentById(id);
    },
    enabled: !!id,
  });
}
