import { NextRequest, NextResponse } from 'next/server';
import { TProfileRequestTg } from '@/types';
import { axiosInstance } from '@/services';

const TELEGRAM_TOKEN = '8027400923:AAEtXhvBMtQlJ5tD8ud5WUAUGnf2TYkejho';
const CHAT_ID = '-1002838520857';

export async function POST(req: NextRequest) {
  const data = (await req.json()) as TProfileRequestTg;

  try {
    await axiosInstance.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: `📥 Запрос на профиль:\n\nUsername: @${data.username}\nИгрок: https://rechutd.ru/player/${data.playerId}\nИмя игрока: ${data.playerName}`,
      }
    );

    return NextResponse.json(true);
  } catch (err) {
    return NextResponse.json(err);
  }
}
