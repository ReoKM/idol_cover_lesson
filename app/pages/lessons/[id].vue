<script setup lang="ts">
// 共通の型定義を読み込む
import type { Lesson } from '~/types';

// APIから返ってくるデータの型を定義
interface ApiResponse {
  lesson: Lesson;
  participants: string[];
}

// useRouteフックを使って、現在のルート情報にアクセス
const route = useRoute();
// URLの動的な部分（[id]の部分）を取得
const lessonId = route.params.id;

// 取得したIDを使って、対応するAPIエンドポイントを呼び出す
const { data, pending, error } = await useFetch<ApiResponse>(`/api/lessons/${lessonId}`);

// 日付と時間を組み合わせて表示用にフォーマットする算出プロパティ
const formattedDateTime = computed(() => {
  if (!data.value?.lesson) return '';
  const { date, time } = data.value.lesson;
  const dateTimeString = `${date} ${time}`;
  return new Date(dateTimeString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});
</script>

<template>
  <div class="page-background">
    <div v-if="pending" class="card">
      <p>レッスン情報を読み込んでいます...</p>
    </div>

    <div v-else-if="error" class="card">
      <h2>エラー</h2>
      <p>レッスン情報の取得に失敗しました。</p>
      <p>理由: {{ error.statusMessage }}</p>
      <NuxtLink to="/">一覧に戻る</NuxtLink>
    </div>

    <div v-else-if="data && data.lesson" class="card">
      <div class="content-section">
        <h1 class="title">レッスン詳細</h1>
        <div class="detail-item">
          <span class="label">日時：</span>
          <span class="value">{{ formattedDateTime }}</span>
        </div>
        <div class="detail-item">
          <span class="label">グループ：</span>
          <span class="value">{{ data.lesson.group }}</span>
        </div>
        <div class="detail-item">
          <span class="label">楽曲：</span>
          <span class="value">{{ data.lesson.song }}</span>
        </div>
        <div class="detail-item">
          <span class="label">場所：</span>
          <span class="value">{{ data.lesson.location }}</span>
        </div>
      </div>
      
      <div class="content-section">
        <h2 class="title">参加予定者</h2>
        <div v-if="data.participants && data.participants.length > 0" class="participants-list">
          {{ data.participants.join(' / ') }}
        </div>
        <div v-else>
          <p>現在の予約者はいません。</p>
        </div>
      </div>

      <NuxtLink to="/" class="back-link">一覧に戻る</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.page-background {
  min-height: 100vh;
  background-color: #f0f8ff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}

.card {
  background-color: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 600px;
  font-family: sans-serif;
}

.back-link {
    display: flex;
    text-decoration: none;
    justify-content: center;
    align-items: center;
    width: 250px;
    margin:0 auto;
    padding: .9em 2em;
    border: none;
    border-radius: 5px;
    box-shadow: 0 2px 3px rgb(0 0 0 / 25%), 0 2px 3px -2px rgb(0 0 0 / 15%);
    background-color: #2589d0;
    color: #fff;
    font-weight: 600;
    font-size: 1em;
}

.back-link::after {
    transform: rotate(45deg);
    width: 5px;
    height: 5px;
    margin-left: 10px;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
    content: '';
}

.back-link:hover {
    background-color: #1579c0;
}

.content-section {
  margin-bottom: 2.5rem;
}
.content-section:last-child {
  margin-bottom: 0;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.label {
  color: #555;
  width: 80px; /* ラベルの幅を固定してコロンの位置を揃える */
  flex-shrink: 0; /* 幅が縮まないようにする */
}

.value {
  font-weight: 500;
}

.participants-list {
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.6;
}
</style>