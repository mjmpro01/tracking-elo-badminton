import { useQuery } from "@tanstack/react-query";
import { fetchPlayers } from "../api/players";

export function usePlayers(search?: string) {
  return useQuery({
    queryKey: ["players", { search }],
    queryFn: () => fetchPlayers({ search }),
  });
}

