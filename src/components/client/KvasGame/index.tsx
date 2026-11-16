'use client';

import '@mantine/core/styles.css';
import { Drawer, MantineProvider } from '@mantine/core';
import { CSSProperties, useCallback, useEffect, useState } from 'react';
import { canBuyAny } from './logic/selectors';
import { FinalScreen } from './FinalScreen';
import { CanMeter, HUD } from './HUD';
import { useGame } from './hooks/useGame';
import { LeaderboardPanel, NicknameGate } from './Leaderboard';
import { Scene } from './Scene';
import { ShopRoom } from './ShopRoom';
import { ShopSkills } from './ShopSkills';
import { TGameState, TSkillId } from './types';
import s from './styles.module.scss';

type KvasGameProps = {
  fontClass: string;
};

const PLAYER_ID = 1;

const iconBg = (index: number): CSSProperties => ({
  backgroundImage: 'url(/game/kvas/props/icons.png)',
  backgroundSize: '416px 32px',
  backgroundPosition: `${-index * 32}px 0`,
});

const DRAWER_STYLES = {
  content: {
    background: '#1b120b',
    color: '#f4f1e8',
    borderTop: '3px solid #e08a20',
  },
  header: {
    background: '#1b120b',
    color: '#f6d27a',
    borderBottom: '2px solid #3a2414',
  },
  title: { color: '#f6d27a', fontSize: 20, width: '100%' },
  body: { color: '#f4f1e8', paddingTop: 12 },
  close: { color: '#f6d27a', width: 44, height: 44 },
} as const;

const Shops = ({
  state,
  onSkill,
  onRoom,
  onTab,
}: {
  state: TGameState;
  onSkill: (id: TSkillId) => void;
  onRoom: () => void;
  onTab: () => void;
}) => {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <div className={s.drawerTabs}>
        <button
          type="button"
          className={`${s.drawerTab} ${tab === 0 ? s.drawerTabActive : ''}`}
          onClick={() => {
            onTab();
            setTab(0);
          }}
        >
          Навыки
        </button>
        <button
          type="button"
          className={`${s.drawerTab} ${tab === 1 ? s.drawerTabActive : ''}`}
          onClick={() => {
            onTab();
            setTab(1);
          }}
        >
          Раздевалка
        </button>
      </div>
      {tab === 0 ? <ShopSkills state={state} onBuy={onSkill} /> : <ShopRoom state={state} onBuy={onRoom} />}
    </div>
  );
};

const Match = () => {
  const game = useGame(PLAYER_ID);
  const [shopOpen, setShopOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);

  const openBoard = useCallback(() => {
    game.clickUi();
    setBoardOpen(true);
  }, [game]);

  if (!game.state || !game.profile) return <p className={s.warmup}>Разминка...</p>;

  const hasUpgrade = canBuyAny(game.state);
  const needsNickname = game.profile.nickname.length < 2;

  return (
    <div className={s.layout}>
      <Scene
        state={game.state}
        bodyFrame={game.bodyFrame}
        headFrame={game.headFrame}
        canPop={game.canPop}
        shake={game.shake}
        dark={game.dark}
        coach={game.coach}
        coachYell={game.coachYell}
        cleaner={game.cleaner}
        pigeon={game.pigeon}
        teammate={game.teammate}
        teammateFrame={game.teammateFrame}
        velo={game.velo}
        veloImpulse={game.veloImpulse}
        onSip={(point) => game.sip(false, point)}
        onPigeon={game.pokePigeon}
      />

      <div className={s.popups} aria-hidden>
        {game.popups.map((popup) => (
          <span
            key={popup.id}
            className={`${s.popup} ${s[`popup_${popup.tone}`]}`}
            style={{ left: popup.x, top: popup.y }}
          >
            {popup.text}
          </span>
        ))}
      </div>

      <div className={s.hudOverlay}>
        <HUD state={game.state} onSound={game.toggleSound} onLeaderboard={openBoard} />
      </div>

      <div className={s.canDock}>
        <CanMeter state={game.state} />
      </div>

      <button
        type="button"
        className={s.shopBtn}
        onClick={() => {
          game.clickUi();
          setShopOpen(true);
        }}
      >
        <span className={s.shopBtnIcon} style={iconBg(4)} aria-hidden />
        <span>Прокачка</span>
        {hasUpgrade && <span className={s.badge} aria-label="Доступно улучшение" />}
      </button>

      {needsNickname && (
        <NicknameGate
          profile={game.profile}
          onSubmit={(nick) => {
            game.clickUi();
            game.setNickname(nick);
          }}
        />
      )}

      <Drawer
        opened={shopOpen}
        onClose={() => setShopOpen(false)}
        position="bottom"
        size="78%"
        title={
          <span className={s.drawerTitleRow}>
            <span>Прокачка</span>
            <span className={s.drawerBank}>
              {game.state.kvasiki.toLocaleString('ru-RU')} кв.
            </span>
          </span>
        }
        styles={DRAWER_STYLES}
      >
        <Shops
          state={game.state}
          onSkill={game.buySkill}
          onRoom={game.buyRoom}
          onTab={game.clickUi}
        />
      </Drawer>

      <Drawer
        opened={boardOpen}
        onClose={() => setBoardOpen(false)}
        position="bottom"
        size="82%"
        title={
          <span className={s.drawerTitleRow}>
            <span>Общий рейтинг</span>
            <span className={s.drawerBank}>{game.state.cans} бан.</span>
          </span>
        }
        styles={DRAWER_STYLES}
      >
        <LeaderboardPanel
          opened={boardOpen}
          profile={game.profile}
          cans={game.state.cans}
          sips={game.state.sips}
          onRename={game.setNickname}
        />
      </Drawer>

      {game.finalOpen && (
        <FinalScreen
          state={game.state}
          onContinue={game.continueSeason}
          onReset={game.reset}
        />
      )}
    </div>
  );
};

export const KvasGame = ({ fontClass }: KvasGameProps) => {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <MantineProvider>
      <div className={`${s.root} ${fontClass}`}>
        <Match />
      </div>
    </MantineProvider>
  );
};
