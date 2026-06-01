import api from './client';

export interface GeneratedCaption {
  caption: string;
  prompt: string;
}

export interface CaptionRequest {
  platform: 'TikTok' | 'YouTube' | 'Instagram';
  title: string;
  style?: string;
}

export async function generateCaption(input: CaptionRequest) {
  const { data } = await api.post<GeneratedCaption>('/ai/caption', input);
  return data;
}
