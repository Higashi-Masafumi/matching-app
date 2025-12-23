import type { Database as BetterSqlite3Instance } from 'better-sqlite3';

const UNIVERSITY_TABLE = 'universities';
const PROFILE_TABLE = 'profiles';
const INTENT_TABLE = 'intent_options';
const WEIGHT_PRESET_TABLE = 'weight_presets';
const VERIFICATION_FLAG_TABLE = 'verification_flags';

type SeedProfile = {
  id: string;
  name: string;
  universityId: string;
  majors: string[];
  interests: string[];
  languages: string[];
  bio?: string;
  preferredLocations: string[];
};

const universitySeeds = [
  {
    id: 'utokyo',
    name: '東京大学',
    city: '東京',
    region: '関東',
    country: 'JP',
    tags: ['国立', '総合'],
    programs: ['情報理工', '工学部', '経済学部'],
    verificationLevel: 'strict',
    website: 'https://www.u-tokyo.ac.jp',
  },
  {
    id: 'kyodai',
    name: '京都大学',
    city: '京都',
    region: '関西',
    country: 'JP',
    tags: ['国立', '総合'],
    programs: ['総合人間', '工学部', '農学部'],
    verificationLevel: 'strict',
    website: 'https://www.kyoto-u.ac.jp',
  },
  {
    id: 'waseda',
    name: '早稲田大学',
    city: '東京',
    region: '関東',
    country: 'JP',
    tags: ['私立', '文理複合'],
    programs: ['基幹理工', '政治経済', '商学部'],
    verificationLevel: 'basic',
    website: 'https://www.waseda.jp',
  },
  {
    id: 'keio',
    name: '慶應義塾大学',
    city: '東京',
    region: '関東',
    country: 'JP',
    tags: ['私立', '文理複合'],
    programs: ['理工学部', '総合政策', '環境情報'],
    verificationLevel: 'basic',
    website: 'https://www.keio.ac.jp',
  },
  {
    id: 'osaka',
    name: '大阪公立大学',
    city: '大阪',
    region: '関西',
    country: 'JP',
    tags: ['公立', '総合'],
    programs: ['経済学部', '医学部', '都市科学'],
    verificationLevel: 'basic',
    website: 'https://www.omu.ac.jp',
  },
];

const profileSeeds: SeedProfile[] = [
  {
    id: 'user_456',
    name: 'Mika Sato',
    universityId: 'waseda',
    majors: ['Economics', 'Data Science'],
    interests: ['AI ethics', 'Music'],
    languages: ['ja', 'en'],
    bio: 'Looking for research exchange opportunities.',
    preferredLocations: ['Tokyo', 'Osaka'],
  },
  {
    id: 'candidate_001',
    name: 'Hiro Tanaka',
    universityId: 'utokyo',
    majors: ['Computer Science'],
    interests: ['Machine Learning', 'Music', 'Language Exchange'],
    languages: ['ja', 'en'],
    bio: 'Interested in study abroad research projects.',
    preferredLocations: ['Tokyo'],
  },
  {
    id: 'candidate_002',
    name: 'Aiko Morita',
    universityId: 'kyodai',
    majors: ['Agriculture'],
    interests: ['Sustainability', 'AI ethics'],
    languages: ['ja'],
    bio: 'Exploring smart agriculture and climate tech.',
    preferredLocations: ['Kyoto', 'Osaka'],
  },
  {
    id: 'candidate_003',
    name: 'Daichi Suzuki',
    universityId: 'keio',
    majors: ['Political Science', 'Economics'],
    interests: ['Music', 'Debate', 'Policy'],
    languages: ['ja', 'en', 'fr'],
    bio: 'Looking to connect with students interested in policy research.',
    preferredLocations: ['Tokyo'],
  },
];

const intentOptionSeeds = [
  { id: 'same', label: '同じ大学でマッチ', description: '学内コミュニティを固めたい', radiusKm: 0 },
  { id: 'nearby', label: '近隣大学と繋がる', description: '同じエリアでイベントをしたい', radiusKm: 30 },
  { id: 'open', label: '全国どこでも', description: '進学・交換留学の相談をしたい', radiusKm: null },
];

const weightPresetSeeds = [
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

const verificationFlagSeeds = [
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

export const bootstrapDatabase = (connection: BetterSqlite3Instance) => {
  connection.exec(
    `CREATE TABLE IF NOT EXISTS ${UNIVERSITY_TABLE} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      country TEXT NOT NULL,
      tags TEXT NOT NULL,
      programs TEXT NOT NULL,
      verification_level TEXT NOT NULL,
      website TEXT
    );
    CREATE TABLE IF NOT EXISTS ${PROFILE_TABLE} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      university_id TEXT NOT NULL,
      majors TEXT NOT NULL,
      interests TEXT NOT NULL,
      languages TEXT NOT NULL,
      bio TEXT,
      preferred_locations TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ${INTENT_TABLE} (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL,
      radius_km INTEGER
    );
    CREATE TABLE IF NOT EXISTS ${WEIGHT_PRESET_TABLE} (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      weight_major REAL NOT NULL,
      weight_campus REAL NOT NULL,
      weight_activity REAL NOT NULL,
      note TEXT NOT NULL,
      is_active INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ${VERIFICATION_FLAG_TABLE} (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL,
      required INTEGER NOT NULL
    );`
  );

  seedTable(connection, UNIVERSITY_TABLE, () => {
    const stmt = connection.prepare(
      'INSERT OR REPLACE INTO universities (id, name, city, region, country, tags, programs, verification_level, website) VALUES (@id, @name, @city, @region, @country, @tags, @programs, @verificationLevel, @website)'
    );

    const insertMany = connection.transaction((rows: typeof universitySeeds) => {
      for (const row of rows) {
        stmt.run({
          ...row,
          tags: JSON.stringify(row.tags),
          programs: JSON.stringify(row.programs),
        });
      }
    });

    insertMany(universitySeeds);
  });

  seedTable(connection, PROFILE_TABLE, () => {
    const stmt = connection.prepare(
      'INSERT OR REPLACE INTO profiles (id, name, university_id, majors, interests, languages, bio, preferred_locations) VALUES (@id, @name, @universityId, @majors, @interests, @languages, @bio, @preferredLocations)'
    );

    const insertMany = connection.transaction((rows: SeedProfile[]) => {
      for (const row of rows) {
        stmt.run({
          ...row,
          majors: JSON.stringify(row.majors),
          interests: JSON.stringify(row.interests),
          languages: JSON.stringify(row.languages),
          preferredLocations: JSON.stringify(row.preferredLocations),
        });
      }
    });

    insertMany(profileSeeds);
  });

  seedTable(connection, INTENT_TABLE, () => {
    const stmt = connection.prepare(
      'INSERT OR REPLACE INTO intent_options (id, label, description, radius_km) VALUES (@id, @label, @description, @radiusKm)'
    );

    const insertMany = connection.transaction((rows: typeof intentOptionSeeds) => {
      for (const row of rows) {
        stmt.run(row);
      }
    });

    insertMany(intentOptionSeeds);
  });

  seedTable(connection, WEIGHT_PRESET_TABLE, () => {
    const stmt = connection.prepare(
      'INSERT OR REPLACE INTO weight_presets (id, title, weight_major, weight_campus, weight_activity, note, is_active) VALUES (@id, @title, @weight_major, @weight_campus, @weight_activity, @note, @is_active)'
    );

    const insertMany = connection.transaction((rows: typeof weightPresetSeeds) => {
      for (const row of rows) {
        stmt.run({
          id: row.id,
          title: row.title,
          weight_major: row.weights.major,
          weight_campus: row.weights.campus,
          weight_activity: row.weights.activity,
          note: row.note,
          is_active: row.isActive ? 1 : 0,
        });
      }
    });

    insertMany(weightPresetSeeds);
  });

  seedTable(connection, VERIFICATION_FLAG_TABLE, () => {
    const stmt = connection.prepare(
      'INSERT OR REPLACE INTO verification_flags (id, label, description, required) VALUES (@id, @label, @description, @required)'
    );

    const insertMany = connection.transaction((rows: typeof verificationFlagSeeds) => {
      for (const row of rows) {
        stmt.run({ ...row, required: row.required ? 1 : 0 });
      }
    });

    insertMany(verificationFlagSeeds);
  });
};

const seedTable = (connection: BetterSqlite3Instance, tableName: string, seedAction: () => void) => {
  const { count } = connection.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as {
    count: number;
  };

  if (count === 0) {
    seedAction();
  }
};
