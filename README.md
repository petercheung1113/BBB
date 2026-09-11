# BBB Arena bugfix — durable rooms + transparent avatars

## English

### Root causes
1. **「找不到房間」 after create / student join fails**  
   Rooms lived in an in-memory `globalThis` `Map` (`store.server.ts`). On Vercel, each serverless isolate has its own memory. Host `createRoom` could succeed on instance A (UI shows code + QR), while the 1s poll / student `join` hit instance B → `找不到房間`. Cookie-only strategies cannot share a classroom room across devices; a shared store is required.

2. **White boxes behind animal / hat art**  
   `public/arena-avatars/*.png` (and `src/assets/arena-avatars/`) were opaque white RGBA plates. Circular frames (`overflow: hidden` + `object-cover`) showed white squares.

### Fix
1. Persist rooms/players in **Postgres** via existing `getSql()` (Neon when `DATABASE_URL` is set; PGLite for local single-process preview). Schema auto-created + `migrations/0002_arena.sql`. On Vercel **without** `DATABASE_URL`, create fails closed with a clear Neon message (PGLite cannot span isolates).
2. Reprocessed all avatar/hat PNGs to true alpha (white → transparent, cropped/padded square). `avatar-art.tsx` uses `object-contain` + soft tint; CSS keeps `/arena-avatars/` images transparent.

### Deploy (required for production arena)
1. Create a free [Neon](https://neon.tech) project → copy connection string.
2. Vercel project → Settings → Environment Variables → `DATABASE_URL` = Neon URL (Production + Preview).
3. Merge these files into `main`, push, **Redeploy**.
4. `npm run build` runs `db:migrate` and applies `0002_arena.sql`.
5. Open `/arena` → create room → error banner should stay clear; phone join by code should work.

Auth can stay off (`VITE_AUTH_ENABLED=false`). Arena does not call `requireUserId`.

### Files in this zip
```
src/lib/arena/store.server.ts
migrations/0002_arena.sql
src/components/arena/avatar-art.tsx
src/routes/arena.tsx
src/styles.css
public/arena-avatars/*.png
src/assets/arena-avatars/*.png
README.md
```

---

## 粵語／中文

### 原因
1. **開房後顯示「找不到房間」、學生入房失敗**  
   房間只存在 serverless 記憶體 `Map`。Vercel 多個 instance 唔共享記憶體 → 開房喺 A，poll／join 去到 B 就 404。Cookie 策略唔可以令全班電話共享同一個房間，一定要有共用 DB。

2. **頭像白色方塊**  
   PNG 係不透明白底，圓形框裁切後見到白盒。

### 修法
1. 房間改存 **Postgres／Neon**（本地無 `DATABASE_URL` 用 PGLite）。Vercel 冇設 `DATABASE_URL` 會明確提示要設 Neon。
2. 頭像／帽 PNG 去白底變透明；UI 用 `object-contain`。

### 點部署
1. 開免費 Neon → 複製 `DATABASE_URL`
2. Vercel Environment Variables 加 `DATABASE_URL` → Redeploy
3. 覆蓋／合併以上檔案入 repo → push
4. 測 `/arena` 開房 + 手機掃碼入房

