<script setup lang="ts">
import { useFetch } from 'nuxt/app';
import type { Lesson } from '~/types';

// APIから全レッスンデータを取得する
// useFetchはNuxt 3の推奨データ取得方法
const { data: lessons, pending, error } = await useFetch<Lesson[]>('/api/lessons');
</script>

<template>
  <div class="page-container">
    <h1 class="title">レッスン一覧</h1>

    <div class="filters">
      <select>
        <option>すべての月</option>
      </select>
      <select>
        <option>すべてのグループ</option>
      </select>
    </div>

    <div class="lesson-list">
      <p v-if="pending">読み込み中...</p>
      
      <p v-else-if="error">データの取得に失敗しました。</p>

      <div v-else>
        <LessonCard
          v-for="lesson in lessons"
          :key="lesson.lesson_id"
          :lesson="lesson"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  font-family: sans-serif;
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