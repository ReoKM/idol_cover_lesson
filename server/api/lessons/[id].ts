import { google } from "googleapis";

export default defineEventHandler(async (event) => {
  try {
    // 1. URLから動的なID部分を取得 (例: /api/lessons/L001 -> 'L001')
    const lessonId = getRouterParam(event, 'id');

    // IDがURLに含まれていない場合はエラーを返す
    if (!lessonId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request: Lesson ID is required',
      });
    }

    // 2. Google Sheets APIへの認証
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const range = process.env.GOOGLE_LESSONSHEET_RANGE;

    // 3. スプレッドシートからデータを取得
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const allLessonRows = response.data.values || [];

    // スプレッドシートの列インデックスを定数として定義
    const LESSON_COLUMN_INDICES = {
      DATE: 1,
      TIME: 2,
      GROUP: 3,
      LOCATION: 4,
      SONG: 7,
      LESSON_ID: 14,
    };

    // 全レッスンの中から、IDが一致する行を1つ見つける
    const lessonRow = allLessonRows.find(row => row[LESSON_COLUMN_INDICES.LESSON_ID] === lessonId);

    // IDに一致するレッスンが見つからない場合はエラー
    if (!lessonRow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson Not Found',
      });
    }
    
    // 見つかった行をオブジェクトに整形
    const lessonDetails = {
      lesson_id: lessonRow[LESSON_COLUMN_INDICES.LESSON_ID],
      date: lessonRow[LESSON_COLUMN_INDICES.DATE],
      time: lessonRow[LESSON_COLUMN_INDICES.TIME],
      group: lessonRow[LESSON_COLUMN_INDICES.GROUP],
      location: lessonRow[LESSON_COLUMN_INDICES.LOCATION],
      song: lessonRow[LESSON_COLUMN_INDICES.SONG],
    };

    // 4. 参加者リストの取得
    const reservationResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: process.env.GOOGLE_RESERVATIONLIST_RANGE,
    });
    const allReservationRows = reservationResponse.data.values || [];

    // 予約リストのスプレッドシートの列インデックスを定数として定義
    const RESERVATION_COLUMN_INDICES = {
      PARTICIPANT_NAME: 2,
      LESSON_ID: 10,
    };

    // 全予約データの中から、IDが一致するものをすべて抽出
    const participants = allReservationRows
        .filter(row => row[RESERVATION_COLUMN_INDICES.LESSON_ID] === lessonId) // レッスンIDで絞り込み
        .map(row => row[RESERVATION_COLUMN_INDICES.PARTICIPANT_NAME]); // 参加者名だけを抜き出す

    // 5. レッスン詳細と参加者リストをまとめて返す
    return {
      lesson: lessonDetails,
      participants: participants,
    };

  } catch (error: any) {
    // 404エラーなど、意図したエラーはそのままスロー
    if (error.statusCode) {
        throw error;
    }
    console.error('Error fetching lesson details:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});