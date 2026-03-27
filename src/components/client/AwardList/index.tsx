import { Award as AwardType } from '@prisma/client';
import s from './styles.module.scss';
import { Award } from '@/components/client/Award';

type AwardsProps = {
  data: AwardType[];
};

export const AwardList = ({ data }: AwardsProps) => {
  const awards = data.reduce<{
    match: AwardType[];
    month: AwardType[];
    year: AwardType[];
  }>(
    (acc, item) => {
      return { ...acc, [item.type]: [...acc[item.type], item] };
    },
    { match: [], month: [], year: [] }
  );

  if (!data?.length) {
    return null;
  }

  return (
    <div className={s.main}>
      <h3 className={s.title}>Награды</h3>
      <div className={s.listWrapper}>
        {awards.match.length > 0 && (
          <div className={s.list}>
            <p className={s.listTitle}>Игрок матча</p>
            <div className={s.listContent}>
              {awards.match.slice(0, 3).map((awardItem) => (
                <Award key={awardItem.id} data={awardItem} />
              ))}
              {awards.match.length > 3 && (
                <div className={s.more}>+{awards.match.length - 3}</div>
              )}
            </div>
          </div>
        )}
        {awards.month.length > 0 && (
          <div className={s.list}>
            <p className={s.listTitle}>Игрок месяца</p>
            <div className={s.listContent}>
              {awards.month.slice(0, 3).map((awardItem) => (
                <Award key={awardItem.id} data={awardItem} />
              ))}
              {awards.month.length > 3 && (
                <div className={s.more}>+{awards.month.length - 3}</div>
              )}
            </div>
          </div>
        )}
        {awards.year.length > 0 && (
          <div className={s.list}>
            <p className={s.listTitle}>Игрок Года</p>
            <div className={s.listContent}>
              {awards.year.slice(0, 3).map((awardItem) => (
                <Award key={awardItem.id} data={awardItem} />
              ))}
              {awards.year.length > 3 && (
                <div className={s.more}>+{awards.year.length - 3}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
