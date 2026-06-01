import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const captionRequestSchema = z.object({
  platform: z.enum(['TikTok', 'YouTube', 'Instagram']),
  title: z.string().min(3),
  style: z.string().optional(),
});

router.post('/caption', (req, res) => {
  const { platform, title, style } = captionRequestSchema.parse(req.body);
  const prompt = `Create a high-engagement caption for a ${platform} creator video titled \"${title}\" in a ${style ?? 'bold'} voice.`;
  const caption = `Ready to go viral: ${title} — watch until the end for the growth hack you didn\'t expect.`;

  res.json({ caption, prompt });
});

export default router;
