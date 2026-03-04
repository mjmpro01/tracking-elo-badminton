"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TournamentDetailClient } from "../../../components/tournaments/TournamentDetailClient";

const queryClient = new QueryClient();

type TournamentDetailPageProps = {
  params: {
    id: string;
  };
};

export default function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const { id } = params;

  return (
    <QueryClientProvider client={queryClient}>
      <TournamentDetailClient tournamentId={id} />
    </QueryClientProvider>
  );
}
