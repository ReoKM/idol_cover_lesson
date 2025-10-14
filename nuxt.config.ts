// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/google-fonts'
  ],

  googleFonts: {
    families: {
      // 'Noto Sans JP' を読み込む
      'Noto Sans JP': [400, 700], // 400:標準, 700:太字
    },
    display: 'swap', // フォント読み込み中のテキストの表示方法
  }
})