<script setup lang="ts">
// ref と computed をvueからインポートします
import { ref, computed } from 'vue';
import type { Lesson } from '~/types';

// フィルターの選択状態を保持する変数
const selectedGroup = ref('all');
const selectedMonth = ref('all');

// APIから全レッスンデータを取得
const { data: lessons, pending, error } = await useFetch<Lesson[]>('/api/lessons');

// 選択されたフィルターに応じてレッスンリストを絞り込む算出プロパティ
const filteredLessons = computed(() => {
  if (!lessons.value) return [];

  return lessons.value.filter(lesson => {
    // グループ名での絞り込み条件
    const groupMatch = selectedGroup.value === 'all' || lesson.group === selectedGroup.value;
    
    // 月での絞り込み条件
    const lessonMonth = new Date(lesson.date).getMonth() + 1;
    const monthMatch = selectedMonth.value === 'all' || lessonMonth === Number(selectedMonth.value);

    // 両方の条件を満たすものだけを返す
    return groupMatch && monthMatch;
  });
});

// ドロップダウンに表示するためのユニークなグループリスト
const uniqueGroups = computed(() => {
  if (!lessons.value) return [];
  return [...new Set(lessons.value.map(lesson => lesson.group))];
});

// ドロップダウンに表示するためのユニークな月のリスト
const uniqueMonths = computed(() => {
  if (!lessons.value) return [];
  const months = lessons.value.map(lesson => new Date(lesson.date).getMonth() + 1);
  return [...new Set(months)].sort((a, b) => a - b);
});
</script>

<template>
  <div class="page-container">
    <h1 class="title">レッスン一覧</h1>

    <div class="filters">
      <select v-model="selectedMonth">
        <option value="all">すべての月</option>
        <option v-for="month in uniqueMonths" :key="month" :value="month">
          {{ month }}月
        </option>
      </select>
      <select v-model="selectedGroup">
        <option value="all">すべてのグループ</option>
        <option v-for="group in uniqueGroups" :key="group" :value="group">
          {{ group }}
        </option>
      </select>
    </div>
    <div class="lesson-list">
      <p v-if="pending">読み込み中...</p>
      
      <p v-else-if="error">データの取得に失敗しました。</p>

      <div v-else-if="filteredLessons.length > 0">
        <LessonCard
          v-for="lesson in filteredLessons"
          :key="lesson.lesson_id"
          :lesson="lesson"
        />
      </div>
      <p v-else>対象のレッスンはありません。</p>
      </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  font-family: "Noto Sans JP", sans-serif;
  background-color: #f0f8ff;
}

.title {
  font-size: 2rem;
  margin-bottom: 16px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filters select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: white;
}
</style>