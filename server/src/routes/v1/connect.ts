import { Response, Router } from 'express';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';
import { google } from 'googleapis';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';

const router = Router();

type SocialProfile = {
  email: string;
  name: string;
  provider: 'GOOGLE' | 'MICROSOFT' | 'APPLE';
  providerUserId?: string;
};

const signToken = (userId: string) => jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });

const oauthFailure = (res: Response, message: string) => {
  const target = new URL('/login', env.FRONTEND_URL);
  target.searchParams.set('error', message);
  return res.redirect(target.toString());
};

const finishSocialLogin = async (res: Response, profile: SocialProfile) => {
  const password = await bcrypt.hash(`oauth:${profile.provider}:${profile.providerUserId ?? profile.email}`, 12);
  const user = await prisma.user.upsert({
    where: { email: profile.email.toLowerCase() },
    update: { name: profile.name },
    create: { email: profile.email.toLowerCase(), name: profile.name, password },
  });

  const existingAccount = await prisma.connectedAccount.findFirst({
    where: { userId: user.id, platform: profile.provider },
  });

  if (existingAccount) {
    await prisma.connectedAccount.update({
      where: { id: existingAccount.id },
      data: { platformUserId: profile.providerUserId, username: profile.name },
    });
  } else {
    await prisma.connectedAccount.create({
      data: {
        userId: user.id,
        platform: profile.provider,
        platformUserId: profile.providerUserId,
        username: profile.name,
      },
    });
  }

  const target = new URL('/auth/callback', env.FRONTEND_URL);
  target.searchParams.set('token', signToken(user.id));
  target.searchParams.set('name', user.name);
  target.searchParams.set('email', user.email);

  return res.redirect(target.toString());
};

router.get('/google', (_req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    return oauthFailure(res, 'Google sign-in is not configured yet.');
  }

  const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: ['openid', 'email', 'profile'], prompt: 'consent' });
  return res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const code = String(req.query.code ?? '');
    if (!code) return oauthFailure(res, 'Google did not return an authorization code.');

    const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const me = await oauth2.userinfo.get();
    const email = me.data.email;

    if (!email) return oauthFailure(res, 'Google did not share an email address.');

    return finishSocialLogin(res, {
      provider: 'GOOGLE',
      email,
      name: me.data.name || email.split('@')[0] || 'Google Creator',
      providerUserId: me.data.id || undefined,
    });
  } catch (error) {
    console.error(error);
    return oauthFailure(res, 'Google sign-in failed.');
  }
});


router.get('/youtube', (_req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.YOUTUBE_REDIRECT_URI) {
    return oauthFailure(res, 'YouTube OAuth is not configured yet. Add Google OAuth credentials and YOUTUBE_REDIRECT_URI.');
  }

  const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.YOUTUBE_REDIRECT_URI);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
  });

  return res.redirect(url);
});

router.get('/youtube/callback', async (req, res) => {
  try {
    const code = String(req.query.code ?? '');
    if (!code) return oauthFailure(res, 'YouTube did not return an authorization code.');

    const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.YOUTUBE_REDIRECT_URI);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const me = await oauth2.userinfo.get();
    const email = me.data.email;
    if (!email) return oauthFailure(res, 'Google did not share an email address for the YouTube connection.');

    const password = await bcrypt.hash(`oauth:YOUTUBE:${me.data.id ?? email}`, 12);
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: { name: me.data.name || email.split('@')[0] || 'YouTube Creator' },
      create: { email: email.toLowerCase(), name: me.data.name || email.split('@')[0] || 'YouTube Creator', password },
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelResponse = await youtube.channels.list({ mine: true, part: ['id', 'snippet', 'statistics'] });
    const channel = channelResponse.data.items?.[0];

    const existingAccount = await prisma.connectedAccount.findFirst({
      where: { userId: user.id, platform: 'YOUTUBE', platformUserId: channel?.id ?? me.data.id ?? email },
    });

    const accountData = {
      userId: user.id,
      platform: 'YOUTUBE' as const,
      platformUserId: channel?.id ?? me.data.id ?? email,
      username: channel?.snippet?.title ?? me.data.name ?? email.split('@')[0],
      displayName: channel?.snippet?.title ?? me.data.name ?? 'YouTube Creator',
      channelId: channel?.id,
      profileUrl: channel?.id ? `https://www.youtube.com/channel/${channel.id}` : undefined,
      scopes: Array.isArray(tokens.scope) ? tokens.scope : String(tokens.scope ?? '').split(' ').filter(Boolean),
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      disconnectedAt: null,
      metadata: {
        subscribers: channel?.statistics?.subscriberCount,
        totalViews: channel?.statistics?.viewCount,
        totalVideos: channel?.statistics?.videoCount,
        thumbnail: channel?.snippet?.thumbnails?.high?.url,
      },
    };

    if (existingAccount) {
      await prisma.connectedAccount.update({ where: { id: existingAccount.id }, data: accountData });
    } else {
      await prisma.connectedAccount.create({ data: accountData });
    }

    const target = new URL('/auth/callback', env.FRONTEND_URL);
    target.searchParams.set('token', signToken(user.id));
    target.searchParams.set('name', user.name);
    target.searchParams.set('email', user.email);
    return res.redirect(target.toString());
  } catch (error) {
    console.error(error);
    return oauthFailure(res, 'YouTube connection failed. Confirm the callback URL is registered in Google Cloud.');
  }
});

router.get('/tiktok', (_req, res) => {
  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_REDIRECT_URI) {
    return oauthFailure(res, 'TikTok integration is ready in CreatorScope, but TikTok API credentials are not configured yet.');
  }

  const params = querystring.stringify({
    client_key: env.TIKTOK_CLIENT_KEY,
    response_type: 'code',
    redirect_uri: env.TIKTOK_REDIRECT_URI,
    scope: 'user.info.basic,video.list',
  });
  return res.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`);
});

router.get('/tiktok/callback', (_req, res) => {
  return oauthFailure(res, 'TikTok callback reached CreatorScope. Add token exchange credentials to complete live TikTok ingestion.');
});

router.get('/instagram', (_req, res) => {
  if (!env.INSTAGRAM_CLIENT_ID || !env.INSTAGRAM_REDIRECT_URI) {
    return oauthFailure(res, 'Instagram integration is ready in CreatorScope, but Instagram API credentials are not configured yet.');
  }

  const params = querystring.stringify({
    client_id: env.INSTAGRAM_CLIENT_ID,
    redirect_uri: env.INSTAGRAM_REDIRECT_URI,
    response_type: 'code',
    scope: 'instagram_basic,instagram_manage_insights',
  });
  return res.redirect(`https://api.instagram.com/oauth/authorize?${params}`);
});

router.get('/instagram/callback', (_req, res) => {
  return oauthFailure(res, 'Instagram callback reached CreatorScope. Add Meta token exchange credentials to complete live Instagram ingestion.');
});

router.get('/microsoft', (_req, res) => {
  if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_REDIRECT_URI) {
    return oauthFailure(res, 'Microsoft sign-in is not configured yet.');
  }

  const params = querystring.stringify({
    client_id: env.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: env.MICROSOFT_REDIRECT_URI,
    response_mode: 'query',
    scope: 'openid profile email User.Read',
  });

  return res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`);
});

router.get('/microsoft/callback', async (req, res) => {
  try {
    const code = String(req.query.code ?? '');
    if (!code) return oauthFailure(res, 'Microsoft did not return an authorization code.');
    if (!env.MICROSOFT_CLIENT_SECRET) return oauthFailure(res, 'Microsoft client secret is missing.');

    const tokenRes = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      querystring.stringify({
        client_id: env.MICROSOFT_CLIENT_ID,
        scope: 'openid profile email User.Read',
        code,
        redirect_uri: env.MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code',
        client_secret: env.MICROSOFT_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const profileRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    const email = profileRes.data.mail || profileRes.data.userPrincipalName;
    if (!email) return oauthFailure(res, 'Microsoft did not share an email address.');

    return finishSocialLogin(res, {
      provider: 'MICROSOFT',
      email,
      name: profileRes.data.displayName || email.split('@')[0] || 'Microsoft Creator',
      providerUserId: profileRes.data.id,
    });
  } catch (error) {
    console.error(error);
    return oauthFailure(res, 'Microsoft sign-in failed.');
  }
});

router.get('/apple', (_req, res) => {
  if (!env.APPLE_CLIENT_ID || !env.APPLE_REDIRECT_URI) {
    return oauthFailure(res, 'Apple sign-in is not configured yet.');
  }

  const params = querystring.stringify({
    client_id: env.APPLE_CLIENT_ID,
    redirect_uri: env.APPLE_REDIRECT_URI,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
  });

  return res.redirect(`https://appleid.apple.com/auth/authorize?${params}`);
});

router.post('/apple/callback', async (req, res) => {
  const decodedToken = req.body?.id_token ? jwt.decode(req.body.id_token) : null;
  const appleClaims = typeof decodedToken === 'object' && decodedToken ? decodedToken : {};
  const appleUser = typeof req.body?.user === 'string' ? JSON.parse(req.body.user) : req.body?.user;
  const email = req.body?.email || appleClaims.email;
  const name = [appleUser?.name?.firstName, appleUser?.name?.lastName].filter(Boolean).join(' ');

  if (!email) {
    return oauthFailure(res, 'Apple callback reached the server, but Apple did not provide an email.');
  }

  return finishSocialLogin(res, {
    provider: 'APPLE',
    email,
    name: name || String(email).split('@')[0] || 'Apple Creator',
    providerUserId: req.body?.sub || appleClaims.sub,
  });
});

router.get('/:provider', (req, res) => {
  return oauthFailure(res, `${req.params.provider} is not a supported social provider.`);
});

export default router;
