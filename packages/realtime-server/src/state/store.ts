import { BehaviorSubject, Observable } from 'rxjs';

import { Action } from './actions';
import {
  SessionsState,
  initialSessionsState,
  sessionsReducer,
} from './sessions';

type State = {
  sessions: SessionsState;
};

const initialState = {
  sessions: initialSessionsState,
};

const reducer = (state: State, action: Action, sessionId: string): State => {
  return {
    sessions: sessionsReducer(state.sessions, action, sessionId),
  };
};

type Store = BehaviorSubject<State>;

export const createStore = (): Store => new BehaviorSubject(initialState);

export const createDispatch =
  (sessionId: string, store: Store) => (action: Action) => {
    store.next(reducer(store.getValue(), action, sessionId));
  };

export const createObserve =
  (store: Store) =>
  <T>(selector: (state: State) => T): Observable<T> => {
    store.asObservable().pipe();
  };
