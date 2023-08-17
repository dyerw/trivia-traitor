import { BehaviorSubject, Observable, filter, switchMap } from 'rxjs';
import { produce } from 'immer';

type Game = {
  traitorNickname: string;
};

export type Lobby = {
  code: string;
  nicknames: string[];
  game?: Game;
};

type LobbiesState = Record<string, BehaviorSubject<Lobby>>;

const initialLobbiesState: LobbiesState = {};

const lobbiesSubject = new BehaviorSubject<LobbiesState>(initialLobbiesState);

export function createLobby(nickname: string): Lobby {
  const code = Math.random().toString(36).slice(2, 7);
  const lobby: Lobby = {
    nicknames: [nickname],
    code,
  };

  const newLobbiesState = {
    ...lobbiesSubject.getValue(),
    [code]: new BehaviorSubject(lobby),
  };

  lobbiesSubject.next(newLobbiesState);

  return lobby;
}

export function joinLobby(nickname: string, code: string): Lobby {
  const lobbiesState = lobbiesSubject.getValue();

  const lobby = lobbiesState[code];
  if (lobby === undefined) {
    throw new Error('Lobby not found');
  }

  lobby.next(
    produce(lobby.getValue(), (draft) => {
      draft.nicknames.push(nickname);
    })
  );

  return lobby.getValue();
}

export function subscribeToLobbyChanged(code: string): Observable<Lobby> {
  return lobbiesSubject.pipe(
    filter((lobbiesState) => !!lobbiesState[code]),
    switchMap((lobbiesState) => lobbiesState[code].asObservable())
  );
}

export function startGame(code: string): Game {
  const lobbiesState = lobbiesSubject.getValue();

  const lobby = lobbiesState[code];
  if (lobby === undefined) {
    throw new Error('Lobby not found');
  }

  const lobbyValue = lobby.getValue();

  const newGame: Game = {
    traitorNickname:
      lobbyValue.nicknames[
        Math.floor(Math.random() * lobbyValue.nicknames.length)
      ],
  };
  lobby.next(
    produce(lobby.getValue(), (draft) => {
      draft.game = newGame;
    })
  );

  return newGame;
}
