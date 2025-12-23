export type AdminControl = {
  key: string;
  title: string;
  description: string;
  active: boolean;
  lastUpdated: string;
};

export type AdminState = {
  weightPreset: 'major' | 'campus' | 'activity';
  verificationPolicy: 'strict' | 'relaxed';
  controls: AdminControl[];
};

export const weightPresetCatalog = [
  {
    key: 'major' as const,
    title: '専攻マッチ重視',
    description: '研究領域・専攻の近さを最優先',
  },
  {
    key: 'campus' as const,
    title: 'キャンパス圏重視',
    description: '距離と移動時間をスコアリング',
  },
  {
    key: 'activity' as const,
    title: '活動タグ重視',
    description: 'サークルや課外活動の近さを重視',
  },
];

let adminState: AdminState = {
  weightPreset: 'campus',
  verificationPolicy: 'strict',
  controls: [
    {
      key: 'campusLock',
      title: '大学指定マッチ',
      description: '指定大学同士のマッチングを優先配信。',
      active: true,
      lastUpdated: '2 min ago',
    },
    {
      key: 'geoFilter',
      title: '距離・エリアフィルター',
      description: 'キャンパス間の距離で探索結果を制限。',
      active: true,
      lastUpdated: '5 min ago',
    },
    {
      key: 'idVerification',
      title: '本人確認ステータス固定',
      description: '未確認の学生は探索結果に含めない。',
      active: true,
      lastUpdated: 'Just now',
    },
    {
      key: 'traffic',
      title: 'スロットリング',
      description: '人気大学へのアクセス集中を緩和。',
      active: false,
      lastUpdated: '1 hr ago',
    },
    {
      key: 'eventPriority',
      title: 'イベント用枠制御',
      description: '期間限定イベントに合わせ優先度切替。',
      active: true,
      lastUpdated: 'Today',
    },
  ],
};

const simulateNetwork = async <T>(result: T, failureRate = 0.15) => {
  const delay = 280 + Math.random() * 420;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (Math.random() < failureRate) {
    throw new Error('Mock network error');
  }

  return JSON.parse(JSON.stringify(result)) as T;
};

export async function getAdminControls() {
  return simulateNetwork(adminState, 0.05);
}

export async function setWeightPreset(key: AdminState['weightPreset']) {
  adminState = { ...adminState, weightPreset: key };
  return simulateNetwork(adminState);
}

export async function toggleVerificationPolicy() {
  adminState = {
    ...adminState,
    verificationPolicy: adminState.verificationPolicy === 'strict' ? 'relaxed' : 'strict',
  };
  return simulateNetwork(adminState);
}
