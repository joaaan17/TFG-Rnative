import { Platform } from 'react-native';

function getBaseUrl() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/iapreguntas';
  if (Platform.OS === 'ios' || Platform.OS === 'web')
    return 'http://localhost:3000/api/iapreguntas';
  return 'http://localhost:3000/api/iapreguntas';
}

export async function askAi(
  prompt: string,
  token: string,
): Promise<{ answer: string }> {
  const response = await fetch(`${getBaseUrl()}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Error al consultar la IA');
  }

  return response.json() as Promise<{ answer: string }>;
}
