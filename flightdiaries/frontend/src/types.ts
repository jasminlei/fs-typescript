export const Weather = {
  Sunny: 'sunny',
  Rainy: 'rainy',
  Cloudy: 'cloudy',
  Stormy: 'stormy',
  Windy: 'windy',
} as const;

export type Weather = (typeof Weather)[keyof typeof Weather];

export const Visibility = {
  Great: 'great',
  Good: 'good',
  Ok: 'ok',
  Poor: 'poor',
} as const;

export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export type DiaryEntryBase = {
  date: string;
  weather: Weather;
  visibility: Visibility;
};

export type NewDiaryEntry = DiaryEntryBase & {
  comment?: string;
};

export type DiaryEntry = NewDiaryEntry & {
  id: number;
};

export type NonSensitiveDiaryEntry = Omit<DiaryEntry, 'comment'>;
