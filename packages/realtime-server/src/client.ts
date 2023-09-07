/**
 * This file exports shared types used on the client
 */
import type { appRouter } from './main';

export type { GameOptions } from './state/lobbies';

export type AppRouter = typeof appRouter;

type GameNotStartedState = {
  isStarted: false;
};

type SharedGameState = {
  isStarted: true;
  currentQuestionText: string;
  answers: Record<string, string>;
  yourVoteAnswerId?: string;
  totalVotesSubmitted: number;
  questionsCorrect: number;
  questionsWrong: number;
  gameWinner: 'ongoing' | 'traitor' | 'team';
};

type NonTraitorGameState = {
  isTraitor: false;
};

type TraitorGameState = {
  isTraitor: true;
  explanation: string;
  correctAnswerId: string;
};

export type GameStartedState = SharedGameState &
  (NonTraitorGameState | TraitorGameState);

export type ClientGame = GameNotStartedState | GameStartedState;

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
