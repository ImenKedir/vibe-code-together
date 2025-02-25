export async function startGeneration(prompt: string, width: number, height: number) {
  const response = await fetch(`/.proxy/api/generate`, {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      width,
      height,
    }),
  });

  const data = await response.json();
  return data;
}

export interface GenerationResponse {
  id: string;
  status:
    | 'Pending'
    | 'Task not found'
    | 'Request Moderated'
    | 'Content Moderated'
    | 'Ready'
    | 'Error';
  result: GenerationResult | null;
  progress: number | null;
}

export interface GenerationResult {
  sample: string;
  prompt: string;
  seed: number;
  start_time: number;
  end_time: number;
  duration: number;
}

export async function getGeneration(id: string): Promise<GenerationResponse> {
  const response = await fetch('/.proxy/api/generate?id=' + id);
  const data = await response.json();
  return data;
}
