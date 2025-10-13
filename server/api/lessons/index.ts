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
      const lessons = rows
        // 2. レッスンの日付が今日以降のものだけに絞り込む
        .filter((row) => {
          // B列(row[1])の日付文字列をDateオブジェクトに変換
          const lessonDate = new Date(row[1]);
          // レッスンの日付が今日以降か判定
          return lessonDate >= today;
        })
        .filter((row) => row[7] !== '')
        .filter((row) => row[3] !== '予備')
        .map((row) => ({
          lesson_id: row[14],
          date: row[1],
          time: row[2],
          group: row[3],
          location: row[4],
          song: row[7],
        }
      ));

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