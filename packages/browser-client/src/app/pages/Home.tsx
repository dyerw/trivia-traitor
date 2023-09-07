import { client } from '../../trpc';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ClientLobby } from '@trivia-traitor/realtime-server';
import CreateLobbyForm, {
  CreateLobbyFormInput,
} from '../components/CreateLobbyForm';
import JoinLobbyForm, { JoinLobbyFormInput } from '../components/JoinLobbyForm';
import { useLobby } from '../hooks/use-lobby';

export default function Home() {
  const { lobbyJoined } = useLobby();

  const createLobby = async (createLobbyFormInput: CreateLobbyFormInput) => {
    const lobby: ClientLobby = await client.lobbyCreate.mutate(
      createLobbyFormInput
    );
    lobbyJoined(lobby);
  };

  const joinLobby = async (joinLobbyFormInput: JoinLobbyFormInput) => {
    const lobby: ClientLobby = await client.lobbyJoin.mutate(
      joinLobbyFormInput
    );
    lobbyJoined(lobby);
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
