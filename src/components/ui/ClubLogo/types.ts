export enum NAME_POSITION {
  LEFT = 'left',
  RIGHT = 'right',
  BOTTOM = 'bottom',
}

export type TNextMatchClubProps = {
  logoSrc: string;
  name: string;
  namePosition?: NAME_POSITION;
};
