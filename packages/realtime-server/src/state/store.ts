import _ from 'radash';
import { BehaviorSubject, distinctUntilChanged, map, tap } from 'rxjs';
import {
  observable,
  Observable as TRPCObservable,
} from '@trpc/server/observable';

import { Action } from './actions';
import {
  SessionsState,
  initialSessionsState,
  sessionsReducer,
} from './sessions';
import { LobbiesState, initialLobbiesState, lobbiesReducer } from './lobbies';
import logger from '../logger';
import { WebSocket } from 'ws';
import { TRPCError } from '@trpc/server';

export type State = {
  sessions: SessionsState;
  lobbies: LobbiesState;
};

const initialState = {
  sessions: initialSessionsState,
  lobbies: initialLobbiesState,
};

const reducer = (
  state: State,
  action: Action,
  getSessionId: () => string
): State => {
  return {
    sessions: sessionsReducer(state.sessions, action, getSessionId),
    lobbies: lobbiesReducer(state.lobbies, action, getSessionId),
  };
};

type Store = BehaviorSubject<State>;

export const createStore = (): Store => new BehaviorSubject(initialState);

export const getSessionIdFromWebSocket =
  (ws: WebSocket, store: Store) => () => {
    const foundEntry = Object.entries(store.getValue().sessions.sessions).find(
      ([, session]) => session.websocket == ws
    );
    if (foundEntry === undefined) {
      logger.error(`Unable to find session id for websocket`, {
        store: store.getValue(),
      });
      throw new TRPCError({
        message: 'Session does not exist for connection',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
    return foundEntry[0];
  };

export const createSelect =
  (ws: WebSocket, store: Store) =>
  <T>(selector: (getSessionId: () => string) => (state: State) => T) => {
    return selector(getSessionIdFromWebSocket(ws, store))(store.getValue());
  };

export const createDispatch =
  (ws: WebSocket, store: Store) =>
  (action: Action, sessionIdOverride?: string) => {
    const nextState = reducer(
      store.getValue(),
      action,
      sessionIdOverride === undefined
        ? getSessionIdFromWebSocket(ws, store)
        : () => sessionIdOverride
    );
    logger.info('Action dispatched', {
      action: action,
      nextLobbiesState: { ...nextState.lobbies },
    });
    store.next(nextState);
  };

export const createObserve =
  (ws: WebSocket, store: Store) =>
  <T>(
    selector: (getSessionId: () => string) => (state: State) => T
  ): TRPCObservable<T, Error> => {
    const obs$ = store
      .asObservable()
      .pipe(
        map(selector(getSessionIdFromWebSocket(ws, store))),
        distinctUntilChanged(_.isEqual)
      );
    return observable<T>((emit) => {
      const subscription = obs$.pipe(tap(emit.next)).subscribe();

      return () => {
        subscription.unsubscribe();
      };
    });
  };
