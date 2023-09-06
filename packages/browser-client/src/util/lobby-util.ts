import { ClientLobby, GameStartedState } from '@trivia-traitor/realtime-server';

export const isStarted = (
  lobby: ClientLobby
): lobby is ClientLobby & { game: GameStartedState } => lobby.game.isStarted;
