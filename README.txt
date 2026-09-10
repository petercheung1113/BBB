形狀王國擂台：自創角色 + Kahoot 頒獎台 + 比賽動畫
================================================

用法（建議）：
1. 解壓後，將資料夾內的 `src/` 覆蓋到你的專案 root（同層有 package.json 嗰度）。
2. `src/styles.css` 係完整檔；若你本地改過 styles，可只把 `styles-arena-append.css` 內容貼到你現有 styles.css 最尾。
3. git add / commit / push → Vercel Redeploy（mathkingdom2）。

包含：
- src/lib/arena/*（types, store 記憶體版, actions, client, api.server, pack）
- src/routes/arena.tsx, arena_.join.tsx, api/arena.ts
- src/components/arena/{avatar-badge,character-creator,podium}.tsx
- src/styles.css + styles-arena-append.css

唔包含 node_modules。
