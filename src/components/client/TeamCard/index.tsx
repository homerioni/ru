import Image from 'next/image';
import playerImage from '@/assets/img/player-default.webp';
import s from './styles.module.scss';
import { Club } from '@prisma/client';
import notClubImg from '@/assets/img/not-club.webp';
import {
  Arrow,
  InstagramIcon,
  TelegramIcon,
  TiktokIcon,
  YoutubeIcon,
  VkIcon,
} from '@ui/Icons';
import Link from 'next/link';

type TTeamCardProps = {
  id?: string | number;
  number?: number | null;
  photo?: string | null;
  name: string;
  position: string;
  matches?: number;
  goals?: number;
  assists?: number;
  small?: boolean;
  isTeam?: boolean;
  transfer?: {
    date: Date;
    from: Club | null;
    to: Club | null;
  };
  club?: Club;
  className?: string;
  socials?: {
    telegram?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    vk?: string | null;
  };
};

export const TeamCard = ({ id, ...props }: TTeamCardProps) => {
  return id ? (
    <Link href={`/player/${id}`}>
      <TeamCardContent {...props} />
    </Link>
  ) : (
    <TeamCardContent {...props} />
  );
};

export const TeamCardContent = ({
  number,
  photo,
  position,
  name,
  assists,
  goals,
  matches,
  small,
  isTeam,
  transfer,
  club,
  className,
  socials,
}: TTeamCardProps) => {
  if (transfer) {
    return (
      <div className={`${s.main} ${className}`}>
        <div className={`${s.photo} ${!photo ? s.noPhoto : ''}`}>
          <Image src={photo ?? playerImage} alt={''} width={500} height={500} />
        </div>
        <div className={s.wrapper}>
          {!!number && <p className={s.number}>{number}</p>}
          <div className={s.textWrapper}>
            <p className={s.name}>{name}</p>
            <p className={s.info}>
              <span>Позиция:</span>
              <span>{position}</span>
            </p>
            <p className={s.info}>
              <span>Дата:</span>
              <span>
                {new Date(transfer.date).toLocaleDateString('ru-Ru', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </p>
            <div className={`${s.transfer} ${s.desktop}`}>
              <Image
                src={transfer.from?.logoSrc ?? notClubImg}
                alt={transfer.from?.name ?? 'Свободный агент'}
                width={100}
                height={100}
              />
              <Arrow />
              <Image
                src={transfer.to?.logoSrc ?? notClubImg}
                alt={transfer.to?.name ?? 'Свободный агент'}
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
        <div className={`${s.transfer} ${s.mobile}`}>
          <Image
            src={transfer.from?.logoSrc ?? notClubImg}
            alt={transfer.from?.name ?? 'Свободный агент'}
            width={100}
            height={100}
          />
          <Arrow />
          <Image
            src={transfer.to?.logoSrc ?? notClubImg}
            alt={transfer.to?.name ?? 'Свободный агент'}
            width={100}
            height={100}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${s.main} ${small ? s.small : ''} ${className}`}>
      <div className={s.photo}>
        <Image src={photo ?? playerImage} alt={''} width={500} height={500} />
      </div>
      <div className={s.wrapper}>
        <div className={s.clubWrapper}>
          {club && (
            <Image
              className={s.clubImg}
              src={club.logoSrc}
              alt={club.name}
              width={128}
              height={128}
            />
          )}
          {!!number && <p className={s.number}>{number}</p>}
        </div>
        <div className={s.textWrapper}>
          <p className={s.name}>{name}</p>
          <p className={s.info}>
            <span>{isTeam ? 'Роль:' : 'Позиция:'}</span>
            <span>{position}</span>
          </p>
          <p className={s.info}>
            <span>Матчей:</span>
            <span className={s.num}>{matches}</span>
          </p>
          {!small && (
            <>
              <p className={s.info}>
                <span>Голов:</span>
                <span className={s.num}>{goals}</span>
              </p>
              <p className={s.info}>
                <span>Асистов:</span>
                <span className={s.num}>{assists}</span>
              </p>
            </>
          )}
          {socials && (
            <div className={s.socials}>
              {socials.telegram && (
                <Link
                  href={socials.telegram}
                  className={s.link}
                  target={'_blank'}
                >
                  <TelegramIcon />
                </Link>
              )}
              {socials.instagram && (
                <Link
                  href={socials.instagram}
                  className={s.link}
                  target={'_blank'}
                >
                  <InstagramIcon />
                </Link>
              )}
              {socials.tiktok && (
                <Link
                  href={socials.tiktok}
                  className={s.link}
                  target={'_blank'}
                >
                  <TiktokIcon />
                </Link>
              )}
              {socials.youtube && (
                <Link
                  href={socials.youtube}
                  className={s.link}
                  target={'_blank'}
                >
                  <YoutubeIcon />
                </Link>
              )}
              {socials.vk && (
                <Link href={socials.vk} className={s.link} target={'_blank'}>
                  <VkIcon />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
