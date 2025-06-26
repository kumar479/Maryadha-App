export async function sendPush(tokens: string[], title: string, body: string) {
  const serverKey = Deno.env.get('FCM_SERVER_KEY');
  if (!serverKey || tokens.length === 0) {
    return;
  }

  const payload = {
    registration_ids: tokens,
    notification: {
      title,
      body,
    },
  };

  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error sending push notification:', res.status, text);
  }
}
