export type CampusRecord = {
  id: string;
  name: string;
  city: string;
  region: string;
  tags: string[];
  programs: string[];
  verificationLevel: 'basic' | 'strict';
};

export type IntentOption = {
  id: 'same' | 'nearby' | 'open' | string;
  label: string;
  description: string;
  radiusKm?: number | null;
};

export type WeightPreset = {
  id: string;
  title: string;
  weights: {
    major: number;
    campus: number;
    activity: number;
  };
  note: string;
  isActive: boolean;
};

export type VerificationFlag = {
  id: string;
  label: string;
  description: string;
  required: boolean;
};

const campusCatalogSeed: CampusRecord[] = [
  {
    id: 'utokyo',
    name: '東京大学',
    city: '東京',
    region: '関東',
    tags: ['国立', '総合'],
    programs: ['情報理工', '工学部', '経済学部'],
    verificationLevel: 'strict',
  },
  {
    id: 'kyodai',
    name: '京都大学',
    city: '京都',
    region: '関西',
    tags: ['国立', '総合'],
    programs: ['総合人間', '工学部', '農学部'],
    verificationLevel: 'strict',
  },
  {
    id: 'waseda',
    name: '早稲田大学',
    city: '東京',
    region: '関東',
    tags: ['私立', '文理複合'],
    programs: ['基幹理工', '政治経済', '商学部'],
    verificationLevel: 'basic',
  },
  {
    id: 'keio',
    name: '慶應義塾大学',
    city: '東京',
    region: '関東',
    tags: ['私立', '文理複合'],
    programs: ['理工学部', '総合政策', '環境情報'],
    verificationLevel: 'basic',
  },
  {
    id: 'osaka',
    name: '大阪公立大学',
    city: '大阪',
    region: '関西',
    tags: ['公立', '総合'],
    programs: ['経済学部', '医学部', '都市科学'],
    verificationLevel: 'basic',
  },
];

const intentOptionsSeed: IntentOption[] = [
  { id: 'same', label: '同じ大学でマッチ', description: '学内コミュニティを固めたい', radiusKm: 0 },
  { id: 'nearby', label: '近隣大学と繋がる', description: '同じエリアでイベントをしたい', radiusKm: 30 },
  { id: 'open', label: '全国どこでも', description: '進学・交換留学の相談をしたい', radiusKm: null },
];

const weightPresetsSeed: WeightPreset[] = [
  {
    id: 'major',
    title: '専攻マッチ重視',
    weights: { major: 0.5, campus: 0.3, activity: 0.2 },
    note: '研究室・専門領域の近さを優先',
    isActive: true,
  },
  {
    id: 'campus',
    title: 'キャンパス圏重視',
    weights: { major: 0.25, campus: 0.55, activity: 0.2 },
    note: '移動距離の短さと生活圏の相性を重視',
    isActive: false,
  },
  {
    id: 'activity',
    title: 'サークル/活動重視',
    weights: { major: 0.2, campus: 0.25, activity: 0.55 },
    note: '課外活動・イベント参加歴でマッチ',
    isActive: false,
  },
];

const verificationFlagsSeed: VerificationFlag[] = [
  {
    id: 'student_id',
    label: '学籍番号 or ポータルで本人確認',
    description: 'ポータルスクリーンショットや学生証画像で在籍確認',
    required: true,
  },
  {
    id: 'university_email',
    label: '大学メールドメインで認証',
    description: '学校発行メールアドレス宛のOTP送信で二段階チェック',
    required: true,
  },
  {
    id: 'club_proof',
    label: 'サークル・学部の在籍証明をアップロード',
    description: '課外活動の在籍証明を提出するとマッチング優先度を加点',
    required: false,
  },
];

const simulateFetch = async <T,>(data: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), 200));
};

export const fetchCampusCatalog = () => simulateFetch(campusCatalogSeed);

export const fetchIntentOptions = () => simulateFetch(intentOptionsSeed);

export const fetchWeightPresets = () => simulateFetch(weightPresetsSeed);

export const fetchVerificationFlags = () => simulateFetch(verificationFlagsSeed);
