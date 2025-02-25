import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'flux-pro-1.1';

export async function POST(req: NextRequest) {
  const { prompt, width, height } = await req.json();

  const response = await fetch(`https://api.us1.bfl.ai/v1/${MODEL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      'x-key': process.env.BFL_API_KEY!,
    },
    body: JSON.stringify({
      prompt,
      width,
      height,
    }),
  });

  const data = await response.json();

  if (data.id == null) {
    return NextResponse.json({ error: 'Failed to start generation' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (id == null) {
    return NextResponse.json({ error: 'No id provided' }, { status: 400 });
  }

  const response = await fetch('https://api.us1.bfl.ai/v1/get_result?id=' + id, {
    headers: {
      accept: 'application/json',
      'x-key': process.env.BFL_API_KEY!,
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
