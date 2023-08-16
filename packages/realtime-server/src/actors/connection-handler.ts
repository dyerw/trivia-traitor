import { ActorSystemRef, spawn, dispatch } from 'nact';
import { WebSocket, RawData } from 'ws';
import { v4 as uuid } from 'uuid';

type ConnectionHandlerState = {
  messagesReceived: number;
};

const initialState: ConnectionHandlerState = {
  messagesReceived: 0,
};

type ConnectionHandlerMessage = {
  tag: 'ReceiveRawWebSocketData';
  payload: RawData;
};

export const spawnConnectionHandler = (
  system: ActorSystemRef,
  ws: WebSocket
) => {
  const actor = spawn(
    system,
    (
      state: ConnectionHandlerState = initialState,
      msg: ConnectionHandlerMessage
    ) => {
      console.log('%s -> from actor', msg);
      ws.send('i have received this many messages: ' + state.messagesReceived);
      return { ...state, messagesReceived: state.messagesReceived + 1 };
    },
    `connection-handler-${uuid()}`
  );

  ws.on('message', function message(data) {
    dispatch(actor, { tag: 'ReceiveRawWebSocketData', payload: data });
  });

  return actor;
};
