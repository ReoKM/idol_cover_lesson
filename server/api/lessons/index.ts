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

    // スプレッドシートからデータを取得
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    // データをJSON形式に整形
    if (rows && rows.length) {
      // タイムゾーン問題を解決するため、常に日本の今日の日付を基準にする
      const japanDateString = new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
      const todayInJapan = new Date(japanDateString);
      
      const COLUMN_INDICES = {
        DATE: 1,
        TIME: 2,
        GROUP: 3,
        LOCATION: 4,
        SONG: 7,
        LESSON_ID: 14,
      };

      const lessons = rows
        .filter((row) => {
          const { DATE, SONG, GROUP } = COLUMN_INDICES;

          // 日付が空の行は無効として除外
          if (!row[DATE]) return false;

          const lessonDate = new Date(row[DATE]);
          
          // 基準をタイムゾーン対応済みの `todayInJapan` に変更
          return lessonDate >= todayInJapan && row[SONG] && row[GROUP] !== '予備';
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
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Unable to fetch lessons',
    });
  }
});