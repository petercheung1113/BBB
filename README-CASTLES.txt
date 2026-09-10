形狀王國 — 主題城堡補丁（圖形城堡 + 分數城堡 MVP）

覆蓋／新增以下檔案到 repo 根目錄對應路徑：

【覆蓋】
1. src/routes/index.tsx          — 首頁改為城堡王國地圖
2. src/components/app-shell.tsx  — 導航：王國 / 圖形城堡 / 分數城堡 / 挑戰 / 擂台
3. src/components/onboarding.tsx — 歡迎文案提到多座城堡
4. src/lib/progress.ts           — 新增 fractions 車站星星（不破壞原有圖形進度）
5. src/routeTree.gen.ts          — 註冊 /castles/shapes、/castles/fractions、/castles/fractions/$stationId

【新增】
6. src/lib/fractions.ts
7. src/components/fractions/visuals.tsx
8. src/components/fractions/stations.tsx
9. src/routes/castles.shapes.tsx
10. src/routes/castles.fractions.tsx
11. src/routes/castles.fractions_.$stationId.tsx

然後：
  npm install
  npm run typecheck
  npm run dev
開 http://localhost:8080/ （城堡地圖）
  → /castles/shapes （原八座圖形島）
  → /castles/fractions （分數五站）
  → /castles/fractions/fair-share 等車站

可選：若本機有 TanStack Router codegen，跑一次 dev/build 讓 routeTree.gen.ts 自動重生亦可。

git add -A && git commit -m "Add topic castles: shapes + fractions MVP"
