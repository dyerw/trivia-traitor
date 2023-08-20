/**
 * This file exports shared types used on the client
 */
import type { appRouter } from './main';

export type AppRouter = typeof appRouter;

export type ClientGame =
  | {
      isStarted: false;
    }
  | {
      isStarted: true;
      youAreTraitor: boolean;
    };

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
