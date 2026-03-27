import { Checkbox, Grid, Input } from '@mantine/core';
import { TGetPlayers } from '@/types';
import { Path, UseFormRegisterReturn } from 'react-hook-form';
import { TForm, PlayerFormData } from '../types';
import s from './styles.module.scss';

type TPlayerMatchItemProps = {
  players: TGetPlayers[];
  homeClubId: number;
  registerPlayerField: (
    playerId: number,
    field: keyof PlayerFormData
  ) => UseFormRegisterReturn<Path<TForm>>;
};

const sortEntities = (items: TGetPlayers[]) => {
  return [...items].sort((a, b) => {
    // 1. isShow === false всегда уходят в самый низ
    if (a.isShow === false && b.isShow !== false) return 1;
    if (a.isShow !== false && b.isShow === false) return -1;

    // 2. Приоритет типов
    const typePriority = {
      player: 1,
      team: 2,
      old_player: 3,
    };

    // Если тип не найден, даем ему низший приоритет
    const priorityA = typePriority[a.type] || 4;
    const priorityB = typePriority[b.type] || 4;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // 3. Сортировка по убыванию playedIn.length
    const lengthA = a.playedIn?.length || 0;
    const lengthB = b.playedIn?.length || 0;

    return lengthB - lengthA;
  });
};

export const PlayerMatchItem = ({
  players,
  homeClubId,
  registerPlayerField,
}: TPlayerMatchItemProps) => {
  return (
    <Grid gutter={10}>
      {sortEntities(players).map((player, i) => (
        <Grid.Col span={{ base: 12, sm: 12 }} key={player.id}>
          <Grid gutter={10} className={s.team}>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <Input.Wrapper
                label={i === 0 ? 'Состав на игру' : undefined}
                className={s.teamLabel}
              >
                <div className={s.teamItem}>
                  <Checkbox
                    tabIndex={-1}
                    size="md"
                    mr="xl"
                    value={player.id}
                    {...registerPlayerField(player.id, 'playerId')}
                  />
                  <p>{player.name}</p>
                </div>
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 3, sm: 2 }}>
              <Input.Wrapper label={i === 0 ? 'Голов' : undefined}>
                <Input
                  placeholder="Голов"
                  type="number"
                  step={1}
                  {...registerPlayerField(player.id, 'goals')}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 3, sm: 2 }}>
              <Input.Wrapper label={i === 0 ? 'Ассистов' : undefined}>
                <Input
                  placeholder="Ассистов"
                  type="number"
                  step={1}
                  {...registerPlayerField(player.id, 'assists')}
                />
              </Input.Wrapper>
            </Grid.Col>
          </Grid>
          <input
            style={{ display: 'none' }}
            {...registerPlayerField(player.id, 'club')}
            value={homeClubId === player.club.id ? 'homeClub' : 'awayClub'}
          />
          <input
            style={{ display: 'none' }}
            {...registerPlayerField(player.id, 'playerNumber')}
            value={player.number ?? 100}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
};
