"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlayerProfileClient } from "../../../components/players/PlayerProfileClient";

const queryClient = new QueryClient();

type PlayerPageProps = {
  params: {
    id: string;
  };
};

export default function PlayerPage({ params }: PlayerPageProps) {
  const { id } = params;

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProfileClient playerId={id} />
    </QueryClientProvider>
  );
}

