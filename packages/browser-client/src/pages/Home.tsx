import { lobbyJoined } from '../store';
import { useNavigate } from '@solidjs/router';

import { client } from '../utils/trpc';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ClientLobby } from '@trivia-traitor/realtime-server';
import CreateLobbyForm, {
  CreateLobbyFormInput,
} from '../components/CreateLobbyForm';
import JoinLobbyForm, { JoinLobbyFormInput } from '../components/JoinLobbyForm';

export default function Home() {
  const navigate = useNavigate();

  const createLobby = async (createLobbyFormInput: CreateLobbyFormInput) => {
    const lobby: ClientLobby = await client.lobbyCreate.mutate(
      createLobbyFormInput
    );
    lobbyJoined(lobby);
    navigate('/lobby', { replace: true });
  };

  const joinLobby = async (joinLobbyFormInput: JoinLobbyFormInput) => {
    const lobby: ClientLobby = await client.lobbyJoin.mutate(
      joinLobbyFormInput
    );
    lobbyJoined(lobby);
    navigate('/lobby', { replace: true });
  };

  return (
    <div>
      Create Lobby:
      <CreateLobbyForm onSubmit={createLobby} />
      or Join Lobby:
      <JoinLobbyForm onSubmit={joinLobby} />
    </div>
  );
}
