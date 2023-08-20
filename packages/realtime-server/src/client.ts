/**
 * This file exports shared types used on the client
 */
import type { appRouter } from './main';

export type AppRouter = typeof appRouter;

type NotStartedState = {
  isStarted: false;
};

type SharedGameState = {
  isStarted: true;
  currentQuestionText: string;
  answers: Record<string, string>;
  yourVoteAnswerId?: string;
  totalVotesSubmitted: number;
};

type NonTraitorGameState = {
  isTraitor: false;
};

type TraitorGameState = {
  isTraitor: true;
  explanation: string;
  correctAnswerId: string;
};

type StartedState = SharedGameState & (NonTraitorGameState | TraitorGameState);

export type ClientGame = NotStartedState | StartedState;

export type ClientPlayer = {
  nickname: string;
  isOwner: boolean;
  isYou: boolean;
};

export type ClientLobby = {
  code: string;
  players: ClientPlayer[];
  game: ClientGame;
};
