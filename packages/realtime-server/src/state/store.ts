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

export type State = {
  sessions: SessionsState;
  lobbies: LobbiesState;
};

const initialState = {
  sessions: initialSessionsState,
  lobbies: initialLobbiesState,
};

const reducer = (state: State, action: Action, sessionId: string): State => {
  return {
    sessions: sessionsReducer(state.sessions, action, sessionId),
    lobbies: lobbiesReducer(state.lobbies, action, sessionId),
  };
};

type Store = BehaviorSubject<State>;

export const createStore = (): Store => new BehaviorSubject(initialState);

export const createSelect =
  (sessionId: string, store: Store) =>
  <T>(selector: (sessionId: string) => (state: State) => T) => {
    return selector(sessionId)(store.getValue());
  };

export const createDispatch =
  (sessionId: string, store: Store) => (action: Action) => {
    console.log('DISPATCH: ', JSON.stringify(action));
    store.next(reducer(store.getValue(), action, sessionId));
  };

export const createObserve =
  (sessionId: string, store: Store) =>
  <T>(
    selector: (sessionId: string) => (state: State) => T
  ): TRPCObservable<T, Error> => {
    const obs$ = store
      .asObservable()
      .pipe(map(selector(sessionId)), distinctUntilChanged(_.isEqual));
    return observable<T>((emit) => {
      const subscription = obs$.pipe(tap(emit.next)).subscribe();

      return () => {
        subscription.unsubscribe();
      };
    });
  };
