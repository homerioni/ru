import { TGetPlayers } from '@/types';

export const playerSortEntities = (
  items: TGetPlayers[],
  isNumberSort = false
) => {
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
    if (isNumberSort) {
      const lengthA = a.number || 9999;
      const lengthB = b.number || 9999;

      return lengthA - lengthB;
    }

    const lengthA = a.playedIn?.length || 0;
    const lengthB = b.playedIn?.length || 0;

    return lengthB - lengthA;
  });
};
