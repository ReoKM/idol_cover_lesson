import { google } from "googleapis";

//apiのイベントハンドラを定義
export default defineEventHandler(async (event) => {
  try {
    // 認証情報の設定をenvファイルから取得
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    // Google Sheets APIクライアントの初期化
    const sheets = google.sheets({ version: "v4", auth });

    // スプレッドシートIDと範囲の設定をenvファイルから取得
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const range = process.env.GOOGLE_LESSONSHEET_RANGE;

    // 3. スプレッドシートからデータを取得
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    // 4. データをJSON形式に整形
    if (rows && rows.length) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // rowsは配列の配列なので、各行をオブジェクトに変換する
      // 例: ['L001', '2025/10/08 20:00', '=LOVE', ...]
      //   -> { lesson_id: 'L001', datetime: '2025/10/08 20:00', ... }
      const COLUMN_INDICES = {
        DATE: 1,
        TIME: 2,
        GROUP: 3,
        LOCATION: 4,
        SONG: 7,
        LESSON_ID: 14,
      };
      const lessons = rows
        // 2. レッスンの日付が今日以降のものだけに絞り込む
        .filter((row) => {
          const { DATE, SONG, GROUP } = COLUMN_INDICES;
          const lessonDate = new Date(row[DATE]);
          return lessonDate >= today && row[SONG] !== '' && row[GROUP] !== '予備';
        })
        .map((row) => {
          const {
            LESSON_ID,
            DATE,
            TIME,
            GROUP,
            LOCATION,
            SONG,
          } = COLUMN_INDICES;

          // どのデータがどのプロパティに対応するのかが一目瞭然になる
          return {
            lesson_id: row[LESSON_ID],
            date: row[DATE],
            time: row[TIME],
            group: row[GROUP],
            location: row[LOCATION],
            song: row[SONG],
          };
        });
      // 整形したデータを返す
      return lessons;
    } else {
      // データがなければ空の配列を返す
      return [];
    }
  } catch (error) {
    console.error('Error fetching lessons:', error);
    // エラーが発生した場合は、クライアントにエラー情報を返す
    // Nuxt 3では throw createError を使うのが一般的
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Unable to fetch lessons',
    });
  }
});