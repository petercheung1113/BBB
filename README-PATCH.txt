BBB 擂台補丁 — 覆蓋／新增呢啲檔到 repo 根目錄對應路徑：

1. 覆蓋 src/routes/index.tsx（首頁「開房擂台」掣）
2. 覆蓋 src/components/app-shell.tsx（導航加「擂台」）
3. 覆蓋 src/routeTree.gen.ts（註冊 /arena）
4. 新增成個 src/lib/arena/
5. 新增 src/routes/arena.tsx
6. 新增 src/routes/arena_.join.tsx
7. 新增 src/routes/api/arena.ts

然後：
  npm install
  npm run dev
開 http://localhost:8080/arena 或撳首頁「開房擂台」

git add -A && git commit -m "Add arena host/join MVP" && git push

