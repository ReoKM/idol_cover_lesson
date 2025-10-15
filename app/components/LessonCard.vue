<script setup lang="ts">
// 1. 新しいAPIのデータ構造に合わせた型を定義します
import type { Lesson } from '~/types';

// 2. 親コンポーネントから受け取るpropsを新しい型に合わせます
const props = defineProps<{
  lesson: Lesson;
}>();

// 3. dateとtimeを組み合わせて表示用にフォーマットします
const formattedDateTime = computed(() => {
  // dateかtimeがなければ空文字を返す
  if (!props.lesson.date || !props.lesson.time) return '';
  
  // "2025/10/8" と "20:00" を組み合わせて "2025/10/8 20:00" のような文字列を作成
  const dateTimeString = `${props.lesson.date} ${props.lesson.time}`;
  const date = new Date(dateTimeString);

  // 日本語の読みやすい形式（例: 10月8日 20:00）に変換
  return date.toLocaleString('ja-JP', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});


// グループ名とCSSクラスのマッピング
const groupColorMap: Record<string, string> = {
  '＝LOVE': 'color-love',
  '乃木坂46': 'color-nogizaka',
};

// グループ名に応じてCSSクラス名を返す算出プロパティ
const cardColorClass = computed(() => {
  return groupColorMap[props.lesson.group] || '';
});
</script>

<template>
  <NuxtLink :to="`/lessons/${lesson.lesson_id}`" class="card-link">
    <div class="lesson-card" :class="cardColorClass">
      <h2 class="datetime">{{ formattedDateTime }}</h2>
      <p class="details">{{ lesson.group }} / {{ lesson.song }}</p>
      <p class="show-link">詳細を見る ></p>
    </div>
  </NuxtLink>
</template>

<style scoped>
/* スタイル部分は変更不要なので、そのまま利用できます */
.lesson-card {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;
}

/* =LOVE用のカラースタイル */
.lesson-card.color-love {
  background-color: #fce4ec; /* light pink */
}

/* 乃木坂46用のカラースタイル */
.lesson-card.color-nogizaka {
  background-color: #f3e5f5; /* light purple */
}

.lesson-card:hover {
  transform: translateY(-4px);
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.datetime {
  font-size: 1.25rem; /* 20px */
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 8px;
}

.details {
  font-size: 1rem; /* 16px */
  margin: 0 0 12px 0;
}

.show-link {
  font-size: 0.875rem; /* 14px */
  color: #555;
  margin: 0;
}
</style>