import { Redirect } from 'expo-router';

// Redireciona para o fluxo correto ao abrir o app
export default function Root() {
  return <Redirect href="/(auth)/login" />;
}
