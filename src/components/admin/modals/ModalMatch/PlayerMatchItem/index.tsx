import { Checkbox, Grid, Input } from '@mantine/core';
import { TGetPlayer } from '@/types';
import { Path, UseFormRegisterReturn } from 'react-hook-form';
import { TForm, PlayerFormData } from '../types';
import s from './styles.module.scss';

type TPlayerMatchItemProps = {
  players: TGetPlayer[];
  registerPlayerField: (
    playerId: number,
    field: keyof PlayerFormData
  ) => UseFormRegisterReturn<Path<TForm>>;
};

export const PlayerMatchItem = ({
  players,
  registerPlayerField,
}: TPlayerMatchItemProps) => {
  return (
    <Grid gutter={10}>
      {players.map((player, i) => (
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
        </Grid.Col>
      ))}
    </Grid>
  );
};
