import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json();

  // Fetch the access token from Discord
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token
  return NextResponse.json({ access_token });
}
