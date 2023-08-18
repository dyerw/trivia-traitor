export type Action =
  | {
      type: 'CREATE_LOBBY';
      payload: {
        code: string;
        nickname: string;
      };
    }
  | {
      type: 'JOIN_LOBBY';
      payload: {
        code: string;
        nickname: string;
      };
    };
