# MEMORIX — Backend uchun to'liq Texnik Topshiriq (TZ)

> **Versiya:** 1.0
> **Sana:** 2026-06-10
> **Frontend:** Nuxt 4 (Vue 3), mobil-first SPA/SSR
> **Maqsad:** Ushbu hujjat frontend kodini to'liq tahlil qilish asosida yozilgan. Backendchi shu hujjat bo'yicha API, admin panel va ish jarayonini qursa, frontend hech qanday qo'shimcha savol-javobsiz ulanadi.

---

## 1. LOYIHA MAZMUNI VA MAQSADI

**Memorix** — foydalanuvchi o'z rasmlaridan shaxsiy **fotokitob (photobook)** yasab, chop etishga buyurtma beradigan onlayn servis (O'zbekiston bozori uchun, +998 telefon raqami orqali ro'yxatdan o'tiladi).

### Foydalanuvchining to'liq yo'li (frontend'da hozir mavjud):

1. **Auth:** Telefon raqam (+998) → SMS OTP (4 xonali) → Ism kiritish → Bosh sahifa.
2. **Bosh sahifa:** Aksiya banneri (promo-kod + countdown timer), Kategoriyalar, Davlatlar, Best Sellers (shablonlar), Yetkazib berish slaydlari, FAQ.
3. **Shablon tanlash:** `/templates` — Popular (shablon kartochkalari) va Categories (qidiruv + akkordeon). Shablon detali (DetailSheet): rasmlar galereyasi, sahifalar soni tanlash (10/20/30).
4. **Rasm yuklash:** `/upload` — sahifalar sonini kiritish + ko'p rasm yuklash → `/upload/upload` — galereyani boshqarish (o'chirish, qo'shish, Pintura editorda tahrirlash).
5. **AI Processing:** `/upload/processing` — "Getting images ready → Picking best images → Creating a story" (hozir frontendda fake 3.2s animatsiya; **backend buni real qilishi kerak**: dublikat/sifatsiz rasmlarni chiqarib tashlash, rasmlarni hikoya tartibida joylash).
6. **Editor:** `/upload/editor` — kitob spread'lari (chap/o'ng sahifa), 9 xil layout (Magazine, Collage, Grid, Moodboard, Scrapbook, Polaroid, Photo Dump, Pinterest, Aesthetic), matn (title + content), stikerlar (emoji, scale, rotation, x/y), fon rangi, undo/redo, sahifa qo'shish/o'chirish/nusxalash.
7. **Preview:** `/upload/preview` — yakuniy ko'rinish + Order summary → savatga qo'shish.
8. **Savat:** `/cart` — miqdor (qty), gift wrap (+$2.99), narxlar (eski/yangi), "low quality photos" roziligi (checkbox) → checkout.
9. **Buyurtmalar:** `/orders` — Active / History tablari. Statuslar: `Pending → In review → In progress → Packing → Delivering → Completed` (+ `Cancelled`).
10. **Buyurtma detali:** `/order-info` — muqova, narx, detallari (Hardcover, 11.5″×8.5″, Gloss paper, shablon, sahifalar soni), gift wrap, jami summa.

### Hozirgi holat (muhim!)
Frontend'da **backend umuman yo'q** — hamma narsa `localStorage`/`sessionStorage`da saqlanadi (`app/utils/albumStorage.ts`). Rasmlar **base64 (dataURL)** ko'rinishida saqlanyapti — bu localStorage limitidan oshyapti (kodda quota catch'lari bor). Shuning uchun **rasm yuklash backend'ning eng birinchi va eng muhim vazifasi**.

### Tillar
i18n: `uz`, `ru` (default), `en`. **Barcha kontent jadvallarida 3 tilda maydonlar bo'lishi shart** (`title_uz`, `title_ru`, `title_en` yoki JSON: `{"uz": "...", "ru": "...", "en": "..."}`). API `Accept-Language` headerga qarab javob qaytarishi yoki barcha tillarni birga qaytarishi mumkin (admin uchun hammasi, klient uchun tanlangan til).

---

## 2. UMUMIY TEXNIK TALABLAR

| Bo'lim | Talab |
|---|---|
| Protokol | REST, JSON. Prefiks: `/api/v1` |
| Auth | JWT — `accessToken` (15–30 min) + `refreshToken` (30 kun). Header: `Authorization: Bearer <token>` |
| SMS | Eskiz.uz yoki Play Mobile (O'zbekiston SMS-shlyuzi). OTP: 4 xonali, amal qilish 2 min, qayta yuborish 60 s, 1 soatda max 5 ta |
| Fayl saqlash | S3-compatible (AWS S3 / MinIO / DigitalOcean Spaces). Yuklash **presigned URL** yoki `multipart/form-data` orqali. Rasmlarga thumbnail (400px) avtomatik generatsiya |
| Rasm limitlari | Format: jpeg/png/webp/heic. Max: 25 MB/rasm. Bitta albomga max 200 ta rasm |
| Pul birligi | Frontendda `$` ko'rsatilgan, lekin to'lov UZS'da bo'ladi — narxlarni **tiyin'da integer** saqlash (`3299000` = 32 990 so'm) va valyuta maydoni qo'shish tavsiya etiladi |
| To'lov | Payme + Click (merchant API). Keyinchalik karta/Stripe qo'shilishi mumkin |
| Pagination | `?page=1&limit=20` → javobda `meta: { page, limit, total, totalPages }` |
| Xatolik formati | Pastdagi 2.1 bandga qarang |
| Rate limit | Auth endpointlarga: 10 req/min/IP |
| Hujjat | Swagger / OpenAPI (`/api/docs`) majburiy |

### 2.1. Yagona javob formati

**Muvaffaqiyat:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
}
```

**Xatolik:**
```json
{
  "success": false,
  "error": {
    "code": "OTP_EXPIRED",
    "message": "Kod muddati tugagan",
    "details": { "field": "code" }
  }
}
```

HTTP kodlar: `200/201` — ok, `400` — validatsiya, `401` — token yo'q/eskirgan, `403` — ruxsat yo'q, `404` — topilmadi, `409` — konflikt, `422` — biznes-xato, `429` — rate limit.

---

## 3. MA'LUMOTLAR BAZASI MODELLARI

```
User            — id, phone (unique), fullName, role (user|admin|operator|printer|courier),
                  language (uz|ru|en), createdAt, lastLoginAt, isBlocked

OtpCode         — id, phone, code, expiresAt, attempts, isUsed, createdAt

Category        — id, slug, name{uz,ru,en}, image, sortOrder, isActive
Country         — id, slug, name{uz,ru,en}, image, sortOrder, isActive

Template        — id, title{uz,ru,en}, colorName{uz,ru,en}, description{uz,ru,en},
                  images[] (3-6 rasm URL), categoryId, countryId (nullable),
                  isBestSeller (bool), isPopular (bool), sortOrder, isActive,
                  salesCount (avtomatik), createdAt

Banner          — id, title{...}, subtitle{...}, image, buttonText{...}, buttonLink,
                  promoCode (nullable, PromoCode bilan bog'liq), countdownTo (datetime, nullable),
                  isActive, sortOrder

InfoSlide       — id, type (delivery|howto), image, text{...}, description{...},
                  buttonText{...}, buttonLink, isDark (bool), sortOrder, isActive

Faq             — id, question{uz,ru,en}, answer{uz,ru,en}, sortOrder, isActive

Sticker         — id, categoryId (StickerCategory), type (emoji|svg|image), value, isActive
StickerCategory — id, name{...}, sortOrder
Background      — id, type (color|image), value (#hex yoki URL), isActive

Album (Book)    — id, userId, templateId (nullable — "o'z rasmlarim" varianti bor),
                  status (draft|processing|ready|ordered),
                  pageCount (10|20|30 yoki ixtiyoriy son),
                  designData (JSONB — editor holati, struktura 5.6 da),
                  coverPhotoId, createdAt, updatedAt

Photo           — id, albumId, userId, originalUrl, thumbnailUrl, fileName,
                  width, height, sizeBytes, sortOrder,
                  aiScore (nullable), isDuplicate (bool), isLowQuality (bool),
                  status (uploaded|processed|rejected)

Product/Pricing — id, name (photobook), coverType (hardcover), size (11.5x8.5),
                  paperFinish (gloss), basePages, basePrice, oldPrice (chizilgan narx),
                  extraPagePrice, isActive
ExtraService    — id, slug (gift_wrap), name{...}, description{...}, price, image, isActive

PromoCode       — id, code (unique, masalan "8MARCH"), discountType (percent|fixed),
                  discountValue (30), validFrom, validTo, maxUsage, usedCount, isActive

Cart            — id, userId (unique), updatedAt
CartItem        — id, cartId, albumId, quantity, extraServices[] (gift_wrap...),
                  unitPrice, oldPrice (snapshot)

Order           — id, orderNumber ("MX-XXXXXXXX"), userId,
                  status (pending|in_review|in_progress|packing|delivering|completed|cancelled),
                  subtotal, discount, extraServicesTotal, deliveryFee, total,
                  promoCodeId (nullable),
                  paymentStatus (unpaid|paid|refunded), paymentMethod (payme|click|cash),
                  agreedLowQuality (bool — majburiy true),
                  receiverName, receiverPhone, regionId, address, comment,
                  cancelReason (nullable), createdAt, updatedAt
OrderItem       — id, orderId, albumId (snapshot bilan), title, coverUrl, pageCount,
                  photoCount, quantity, unitPrice, oldPrice, extraServices JSON
OrderStatusLog  — id, orderId, fromStatus, toStatus, changedBy (userId), comment, createdAt

Region          — id, name{...}, deliveryFee, freeDeliveryFrom (nullable), isActive

Payment         — id, orderId, provider (payme|click), providerTxnId, amount,
                  status (created|paid|cancelled|refunded), payload JSON, createdAt

Notification    — id, userId, type, title{...}, body{...}, isRead, createdAt
Setting         — key, value (JSON) — umumiy sozlamalar (aloqa, ijtimoiy tarmoqlar va h.k.)
```

---

## 4. CLIENT API — TO'LIQ RO'YXAT

### 4.1. Auth

#### `POST /api/v1/auth/send-otp`
Telefon raqamga 4 xonali kod yuboradi. Frontend maska: `+998 (##) ###-##-##`.
```json
// Request
{ "phone": "+998901234567" }

// Response 200
{
  "success": true,
  "data": { "expiresIn": 120, "canResendIn": 60 }
}
// Xatolar: PHONE_INVALID, OTP_TOO_MANY_REQUESTS (429)
```

#### `POST /api/v1/auth/verify-otp`
```json
// Request
{ "phone": "+998901234567", "code": "1234" }

// Response 200 — yangi user (ismi yo'q)
{
  "success": true,
  "data": {
    "isNewUser": true,
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "u_123", "phone": "+998901234567", "fullName": null, "language": "ru" }
  }
}
// isNewUser=true bo'lsa frontend /auth/LoginName (ism kiritish) sahifasiga o'tadi.
// Xatolar: OTP_INVALID, OTP_EXPIRED, OTP_ATTEMPTS_EXCEEDED
```

#### `POST /api/v1/auth/complete-profile` 🔒
Ism kiritish sahifasi (`LoginName.vue`) uchun.
```json
// Request
{ "fullName": "Umidjon Karimov" }
// Response
{ "success": true, "data": { "user": { "id": "u_123", "fullName": "Umidjon Karimov" } } }
```

#### `POST /api/v1/auth/refresh`
```json
{ "refreshToken": "eyJ..." }
// → yangi accessToken + refreshToken
```

#### `POST /api/v1/auth/logout` 🔒
refreshTokenni bekor qiladi.

#### `GET /api/v1/users/me` 🔒
Header dropdown uchun (ism, ID ko'rsatiladi).
```json
{
  "success": true,
  "data": {
    "id": "u_123",
    "phone": "+998901234567",
    "fullName": "beck_makhkamov",
    "publicId": "998765",
    "language": "ru"
  }
}
```

#### `PATCH /api/v1/users/me` 🔒
```json
{ "fullName": "Yangi Ism", "language": "uz" }
```

---

### 4.2. Bosh sahifa kontenti

#### `GET /api/v1/home`
Bosh sahifani **bitta so'rovda** beradi (mobil uchun tezlik muhim). `Accept-Language: uz|ru|en`.
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": 1,
        "title": "International Woman's Day",
        "subtitle": "Celebrate women with a gift as special as she is",
        "image": "https://cdn.memorix.uz/banners/8march.png",
        "buttonText": "Shop now",
        "buttonLink": "/templates",
        "promoCode": "8MARCH",
        "promoText": "30% off with promo code",
        "countdownTo": "2026-03-08T00:00:00+05:00"
      }
    ],
    "categories": [
      { "id": 1, "slug": "travel", "name": "Travel", "image": "https://cdn..." }
    ],
    "countries": [
      { "id": 1, "slug": "egypt", "name": "Egypt", "image": "https://cdn..." }
    ],
    "bestSellers": [
      {
        "id": 1,
        "title": "Travel Vibes",
        "colorName": "Burgundy",
        "description": "Perfect template for adventure and travel memories",
        "images": ["https://cdn.../1.png", "https://cdn.../2.png", "https://cdn.../3.png"]
      }
    ],
    "infoSlides": [
      {
        "id": 1,
        "type": "delivery",
        "image": "https://cdn...",
        "text": "FREE DELIVERY TO YOUR REGION",
        "buttonText": "Show list",
        "buttonLink": "/delivery",
        "isDark": true
      }
    ],
    "howItWorksSlides": [
      { "id": 1, "image": "https://cdn...", "text": "Choose your template", "description": "..." }
    ],
    "faq": [
      { "id": 1, "question": "How it works?", "answer": "..." }
    ]
  }
}
```

#### Alohida endpointlar (xuddi shu strukturada):
- `GET /api/v1/banners`
- `GET /api/v1/categories`
- `GET /api/v1/countries`
- `GET /api/v1/faq` — `/faq` sahifasi uchun to'liq ro'yxat
- `GET /api/v1/info-slides?type=delivery|howto`

---

### 4.3. Shablonlar (Templates)

#### `GET /api/v1/templates`
Query: `?tab=popular` | `?categoryId=1` | `?countryId=2` | `?search=travel` | `?page=1&limit=20`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Travel Vibes",
      "colorName": "Burgundy",
      "description": "Perfect template for adventure and travel memories",
      "images": ["url1", "url2", "url3"],
      "category": { "id": 1, "name": "Travel" },
      "pageOptions": [10, 20, 30]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

#### `GET /api/v1/templates/:id`
DetailSheet uchun bitta shablon (yuqoridagi obyekt).

#### `GET /api/v1/templates/categories-tree`
Templates sahifasidagi "Categories" tabi (akkordeon: Travel → davlatlar ro'yxati):
```json
{
  "success": true,
  "data": [
    {
      "id": 1, "name": "Travel",
      "children": [
        { "id": 10, "name": "Kazakhstan", "templatesCount": 4 },
        { "id": 11, "name": "Turkey", "templatesCount": 6 }
      ]
    },
    { "id": 2, "name": "Family", "children": [] }
  ]
}
```

---

### 4.4. Albom (kitob) va rasm yuklash

> Frontend hozir rasmlarni base64da localStorage'ga yozadi — bu API'lar o'sha oqimni serverga ko'chiradi.

#### `POST /api/v1/albums` 🔒
Albom (draft) yaratish — shablon tanlangach yoki "o'z rasmlarim" oqimida.
```json
// Request
{
  "templateId": 1,          // nullable — shablonsiz bo'lishi mumkin
  "pageCount": 20
}
// Response 201
{
  "success": true,
  "data": {
    "id": "alb_8f2k1",
    "status": "draft",
    "templateId": 1,
    "pageCount": 20,
    "photos": [],
    "designData": null
  }
}
```

#### `POST /api/v1/albums/:id/photos/presign` 🔒
Rasmlar uchun presigned upload URL'lar (tavsiya etilgan usul):
```json
// Request
{
  "files": [
    { "fileName": "IMG_001.jpg", "contentType": "image/jpeg", "sizeBytes": 4200000 }
  ]
}
// Response
{
  "success": true,
  "data": [
    {
      "photoId": "ph_001",
      "uploadUrl": "https://s3.../signed...",
      "expiresIn": 600
    }
  ]
}
// Frontend rasmlarni to'g'ridan-to'g'ri S3 ga PUT qiladi,
// keyin tasdiqlaydi:
```

#### `POST /api/v1/albums/:id/photos/confirm` 🔒
```json
{ "photoIds": ["ph_001", "ph_002"] }
// Response: har bir rasm uchun { id, originalUrl, thumbnailUrl, fileName, sortOrder }
```

> **Muqobil (soddaroq) variant:** `POST /api/v1/albums/:id/photos` `multipart/form-data` (`files[]`) — agar presigned qilish qiyin bo'lsa. Ikkalasidan biri tanlansin, lekin javob strukturasi bir xil bo'lsin.

#### `GET /api/v1/albums/:id/photos` 🔒
Galereya sahifasi (`/upload/upload`) uchun.

#### `DELETE /api/v1/albums/:id/photos/:photoId` 🔒

#### `PUT /api/v1/albums/:id/photos/:photoId` 🔒
Pintura'da tahrirlangan rasmni almashtirish (yangi presign yoki multipart).

#### `POST /api/v1/albums/:id/process` 🔒 — **AI Processing**
`/upload/processing` sahifasi shu endpointni chaqiradi. Backend (asinxron job):
1. Dublikat rasmlarni aniqlaydi (perceptual hash) → `isDuplicate=true`
2. Sifatsiz/xira rasmlarni aniqlaydi (blur detection) → `isLowQuality=true`
3. Rasmlarni EXIF sana bo'yicha "hikoya" tartibida saralaydi
4. `pageCount` ga mos boshlang'ich `designData` (spread/layout) generatsiya qiladi

```json
// Response 202
{ "success": true, "data": { "jobId": "job_55", "status": "processing" } }
```

#### `GET /api/v1/albums/:id/process-status` 🔒
Frontend progress ringni shu bilan yangilaydi (polling, 1-2 s interval):
```json
{
  "success": true,
  "data": {
    "status": "processing",        // processing | ready | failed
    "progress": 66,                 // 0-100
    "step": "picking_best"          // preparing | picking_best | creating_story
  }
}
// status=ready bo'lganda frontend /upload/editor ga o'tadi
```

#### `GET /api/v1/albums/:id` 🔒
Editor ochilganda to'liq albom: photos + designData.

#### `PUT /api/v1/albums/:id/design` 🔒
Editor holatini saqlash (autosave har 10-15 s yoki har o'zgarishda debounce bilan). `designData` struktura — 5.6 bandda.
```json
// Request
{ "designData": { "spreads": [ ... ] } }
// Response
{ "success": true, "data": { "updatedAt": "2026-06-10T12:00:00Z" } }
```

#### `GET /api/v1/albums` 🔒
Foydalanuvchining draft albomlari ("davom ettirish" uchun).

#### `DELETE /api/v1/albums/:id` 🔒

---

### 4.5. Narxlash va savat

#### `GET /api/v1/products/pricing`
Preview "Order summary" va savat hisob-kitobi uchun:
```json
{
  "success": true,
  "data": {
    "photobook": {
      "coverType": "Hardcover",
      "size": "11.5\" x 8.5\" Vertical",
      "paperFinish": "Gloss paper",
      "pageOptions": [
        { "pages": 10, "price": 2599, "oldPrice": 5198 },
        { "pages": 20, "price": 3299, "oldPrice": 6598 },
        { "pages": 30, "price": 3999, "oldPrice": 7998 }
      ],
      "extraPagePrice": 150,
      "currency": "USD"
    },
    "extraServices": [
      {
        "id": "gift_wrap",
        "name": "Gift wrapped",
        "description": "Select this option to surprise the recipient.",
        "price": 299,
        "image": "https://cdn.../gift.png"
      }
    ]
  }
}
```
> Narxlar **cent/tiyin'da integer**. Frontend `$32.99` qilib chiqaradi.

#### `GET /api/v1/cart` 🔒
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ci_1",
        "album": {
          "id": "alb_8f2k1",
          "title": "Travel Vibes / Burgundy",
          "coverUrl": "https://cdn.../thumb.jpg",
          "pageCount": 20,
          "photoCount": 34
        },
        "quantity": 1,
        "unitPrice": 3299,
        "oldPrice": 6598,
        "extraServices": [{ "id": "gift_wrap", "price": 299 }]
      }
    ],
    "summary": {
      "subtotal": 3299,
      "extraServicesTotal": 299,
      "discount": 0,
      "deliveryFee": 0,
      "total": 3598
    }
  }
}
```

#### `POST /api/v1/cart/items` 🔒
```json
{ "albumId": "alb_8f2k1", "quantity": 1 }
```

#### `PATCH /api/v1/cart/items/:itemId` 🔒
```json
{ "quantity": 2, "extraServices": ["gift_wrap"] }
```

#### `DELETE /api/v1/cart/items/:itemId` 🔒

#### `POST /api/v1/cart/apply-promo` 🔒
```json
// Request
{ "code": "8MARCH" }
// Response — yangilangan summary (discount bilan)
// Xatolar: PROMO_NOT_FOUND, PROMO_EXPIRED, PROMO_LIMIT_REACHED
```

---

### 4.6. Buyurtma (Checkout & Orders)

#### `GET /api/v1/regions`
Yetkazib berish hududlari (checkout forma + "Free delivery" ro'yxati):
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Toshkent shahri", "deliveryFee": 0, "freeDeliveryFrom": null },
    { "id": 2, "name": "Samarqand", "deliveryFee": 300, "freeDeliveryFrom": 5000 }
  ]
}
```

#### `POST /api/v1/orders` 🔒 — Checkout
```json
// Request
{
  "agreedLowQuality": true,        // MAJBURIY true (cart modal checkbox)
  "receiverName": "Umidjon",
  "receiverPhone": "+998901234567",
  "regionId": 1,
  "address": "Chilonzor 5, 12-uy",
  "comment": "",
  "paymentMethod": "payme"         // payme | click | cash
}
// Response 201
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_991",
      "orderNumber": "MX-K3J9F2A1",
      "status": "pending",
      "paymentStatus": "unpaid",
      "total": 3598,
      "createdAt": "2026-06-10T12:30:00Z"
    },
    "payment": {
      "provider": "payme",
      "paymentUrl": "https://checkout.paycom.uz/..."   // frontend shu URLga redirect qiladi
    }
  }
}
// Buyurtma yaratilgach savat tozalanadi, album.status = "ordered"
// Xato: CART_EMPTY, LOW_QUALITY_NOT_AGREED
```

#### `GET /api/v1/orders` 🔒
`/orders` sahifasi — Active/History tablar:
Query: `?tab=active` (pending, in_review, in_progress, packing, delivering) | `?tab=history` (completed, cancelled)
```json
{
  "success": true,
  "data": [
    {
      "id": "ord_991",
      "orderNumber": "MX-K3J9F2A1",
      "title": "Travel Vibes / Burgundy",
      "coverUrl": "https://cdn.../thumb.jpg",
      "status": "in_review",
      "statusLabel": "In review",       // tarjima qilingan label
      "total": 3598,
      "createdAt": "2026-06-10T12:30:00Z"
    }
  ]
}
```

#### `GET /api/v1/orders/:id` 🔒
`/order-info` sahifasi:
```json
{
  "success": true,
  "data": {
    "id": "ord_991",
    "orderNumber": "MX-K3J9F2A1",
    "status": "in_review",
    "paymentStatus": "paid",
    "items": [
      {
        "title": "Travel Vibes / Burgundy",
        "coverUrl": "https://cdn...",
        "quantity": 1,
        "unitPrice": 3299,
        "oldPrice": 6598,
        "pageCount": 20,
        "photoCount": 34,
        "details": {
          "coverType": "Hardcover",
          "size": "11.5\" x 8.5\" Vertical",
          "paperFinish": "Gloss paper",
          "template": "Travel Vibes / Burgundy"
        },
        "extraServices": [{ "name": "Gift wrapped", "price": 299 }]
      }
    ],
    "summary": { "subtotal": 3299, "extraServicesTotal": 299, "discount": 0, "deliveryFee": 0, "total": 3598 },
    "receiver": { "name": "Umidjon", "phone": "+998901234567", "region": "Toshkent shahri", "address": "..." },
    "statusHistory": [
      { "status": "pending", "at": "2026-06-10T12:30:00Z" },
      { "status": "in_review", "at": "2026-06-10T13:00:00Z" }
    ]
  }
}
```

#### `POST /api/v1/orders/:id/cancel` 🔒
Faqat `pending`/`in_review` holatda ruxsat. `{ "reason": "..." }`

#### To'lov callback (server-to-server):
- `POST /api/v1/payments/payme/callback` — Payme Merchant API (JSON-RPC) protokoli bo'yicha
- `POST /api/v1/payments/click/callback` — Click prepare/complete
- To'lov muvaffaqiyatli bo'lganda: `order.paymentStatus = paid`, statusga log yoziladi, userga SMS/notification.

---

### 4.7. Editor resurslari

#### `GET /api/v1/editor/resources`
Editor ochilishida bir marta yuklanadi:
```json
{
  "success": true,
  "data": {
    "layouts": [
      { "id": "layout-magazine", "name": "Magazine Style", "slots": 1 },
      { "id": "layout-collage", "name": "Collage", "slots": 3 },
      { "id": "layout-grid", "name": "Photo Grid", "slots": 4 },
      { "id": "layout-moodboard", "name": "Moodboard", "slots": 5 },
      { "id": "layout-scrapbook", "name": "Scrapbook", "slots": 2 },
      { "id": "layout-polaroid", "name": "Polaroid Collage", "slots": 3 },
      { "id": "layout-dump", "name": "Photo Dump", "slots": 6 },
      { "id": "layout-pinterest", "name": "Pinterest Style", "slots": 4 },
      { "id": "layout-aesthetic", "name": "Aesthetic Collage", "slots": 3 }
    ],
    "stickerCategories": [
      {
        "id": 1, "name": "Travel",
        "stickers": [
          { "id": "st_1", "type": "emoji", "value": "✈️" },
          { "id": "st_2", "type": "image", "value": "https://cdn.../sticker1.png" }
        ]
      }
    ],
    "backgrounds": [
      { "id": "bg_1", "type": "color", "value": "#ececec" },
      { "id": "bg_2", "type": "image", "value": "https://cdn.../bg1.jpg" }
    ]
  }
}
```

---

## 5. ADMIN PANEL

### 5.1. Rollar

| Rol | Huquqlar |
|---|---|
| `admin` | Hamma narsa: kontent, buyurtmalar, userlar, sozlamalar, statistika, operatorlar yaratish |
| `operator` | Buyurtmalarni ko'rish, status o'zgartirish (`pending → in_review → in_progress`), mijoz bilan bog'lanish, bekor qilish |
| `printer` (bosmaxona) | Faqat `in_progress` buyurtmalar: print-fayl yuklab olish, `packing` ga o'tkazish |
| `courier` | `packing/delivering` buyurtmalar: `delivering → completed` |

### 5.2. Admin auth
- `POST /api/v1/admin/auth/login` — `{ "phone": "...", "password": "..." }` (adminlar parol bilan kiradi, OTP shart emas)
- 2FA (ixtiyoriy, lekin tavsiya etiladi)
- Barcha admin endpointlar: `/api/v1/admin/...` prefiksi + rol tekshiruvi

### 5.3. Admin bo'limlari va API'lari

#### 📊 Dashboard — `GET /api/v1/admin/dashboard`
```json
{
  "data": {
    "today":  { "orders": 12, "revenue": 43200, "newUsers": 34 },
    "week":   { "orders": 81, "revenue": 287000 },
    "ordersByStatus": { "pending": 3, "in_review": 5, "in_progress": 8, "packing": 2, "delivering": 4 },
    "revenueChart": [ { "date": "2026-06-01", "revenue": 32000, "orders": 9 } ],
    "topTemplates": [ { "id": 1, "title": "Travel Vibes", "sales": 45 } ]
  }
}
```

#### 📦 Buyurtmalar (eng muhim bo'lim)
- `GET /api/v1/admin/orders` — filtrlar: `?status=&paymentStatus=&dateFrom=&dateTo=&search=` (orderNumber/telefon/ism bo'yicha), pagination
- `GET /api/v1/admin/orders/:id` — to'liq: mijoz, rasmlar, designData, to'lov, status tarixi
- `PATCH /api/v1/admin/orders/:id/status` — `{ "status": "in_progress", "comment": "..." }` — faqat ruxsat etilgan o'tishlar (5.5 band), har o'tish `OrderStatusLog` ga yoziladi, mijozga SMS/push ketadi
- `GET /api/v1/admin/orders/:id/print-file` — **bosmaxona uchun PDF generatsiya** (designData + original rasmlardan 300 DPI, CMYK-ready PDF). Asinxron job bo'lishi mumkin: `{ "jobId": ... }` → `GET .../print-file/status` → tayyor URL
- `GET /api/v1/admin/orders/:id/photos.zip` — original rasmlar arxivi
- `POST /api/v1/admin/orders/:id/cancel` — sabab bilan

#### 🖼 Shablonlar
- `GET/POST/PUT/DELETE /api/v1/admin/templates` — CRUD, 3 tilda maydonlar, rasm yuklash (`POST /api/v1/admin/upload` umumiy fayl-yuklash endpointi), `isBestSeller`, `isPopular`, `sortOrder` (drag&drop tartiblash uchun `PATCH /api/v1/admin/templates/reorder` — `{ "ids": [3,1,2] }`)

#### 🗂 Kategoriyalar va Davlatlar
- `GET/POST/PUT/DELETE /api/v1/admin/categories`, `/api/v1/admin/countries` + reorder

#### 🎨 Banner va slaydlar
- `GET/POST/PUT/DELETE /api/v1/admin/banners` — title/subtitle (3 til), rasm, promo-kod bog'lash, countdown sanasi
- `GET/POST/PUT/DELETE /api/v1/admin/info-slides`

#### 🏷 Promo-kodlar
- `GET/POST/PUT/DELETE /api/v1/admin/promo-codes` + ishlatilish statistikasi (`usedCount`, qaysi buyurtmalarda)

#### 💰 Narxlar va xizmatlar
- `GET/PUT /api/v1/admin/pricing` — sahifa variantlari narxlari, eski narx, qo'shimcha sahifa narxi
- `GET/POST/PUT /api/v1/admin/extra-services` — gift wrap va boshqalar

#### 🚚 Hududlar
- `GET/POST/PUT/DELETE /api/v1/admin/regions` — yetkazish narxi, bepul limit

#### ❓ FAQ
- `GET/POST/PUT/DELETE /api/v1/admin/faq` + reorder

#### ✨ Editor resurslari
- `GET/POST/PUT/DELETE /api/v1/admin/stickers`, `/api/v1/admin/sticker-categories`, `/api/v1/admin/backgrounds`

#### 👥 Foydalanuvchilar
- `GET /api/v1/admin/users` — qidiruv (telefon/ism), pagination
- `GET /api/v1/admin/users/:id` — profil + buyurtmalar tarixi
- `PATCH /api/v1/admin/users/:id/block` / `unblock`
- `GET/POST/PATCH /api/v1/admin/staff` — operator/printer/courier yaratish (faqat admin)

#### ⚙️ Sozlamalar
- `GET/PUT /api/v1/admin/settings` — aloqa ma'lumotlari, ijtimoiy tarmoqlar, OTP/SMS sozlamalari, minimal app versiyasi

### 5.4. Admin panel UI (frontend tomonidan kutiladigan tuzilma)

```
┌─ Sidebar ─────────────┐
│ 📊 Dashboard          │
│ 📦 Buyurtmalar  (12)  │  ← yangi buyurtmalar soni badge
│ 🖼  Shablonlar         │
│ 🗂  Kategoriyalar      │
│ 🌍 Davlatlar          │
│ 🎨 Bannerlar          │
│ 🏷  Promo-kodlar       │
│ 💰 Narxlar            │
│ 🚚 Hududlar           │
│ ❓ FAQ                │
│ ✨ Editor resurslari   │
│ 👥 Foydalanuvchilar    │
│ 👔 Xodimlar           │
│ ⚙️  Sozlamalar         │
└───────────────────────┘
```
- Buyurtmalar jadvalida: № / mijoz / telefon / summa / to'lov / status (rangli badge) / sana / amallar.
- Buyurtma sahifasida: status o'zgartirish tugmalari (faqat keyingi ruxsat etilgan statuslar), rasmlar galereyasi, print-fayl yuklab olish, status tarixi (kim, qachon).
- Barcha kontent formalarida 3 til uchun tab (UZ / RU / EN).
- Yangi buyurtma kelganda real-time bildirishnoma (WebSocket yoki 30s polling).

### 5.5. Buyurtma statuslari oqimi (workflow)

```
                    to'lov OK
pending ──────────► in_review ───► in_progress ───► packing ───► delivering ───► completed
   │                   │           (chop etilmoqda)  (qadoqlash)   (kuryer)
   │                   │
   └───► cancelled ◄───┘   (faqat pending/in_review da; to'langan bo'lsa refund)
```

| O'tish | Kim qiladi | Trigger |
|---|---|---|
| yaratildi → `pending` | tizim | checkout |
| `pending` → `in_review` | tizim | to'lov callback muvaffaqiyatli |
| `in_review` → `in_progress` | operator | dizaynni tekshirib, bosmaxonaga berdi |
| `in_progress` → `packing` | printer | chop etildi |
| `packing` → `delivering` | operator/courier | kuryer oldi |
| `delivering` → `completed` | courier | topshirildi |
| → `cancelled` | mijoz/operator | sabab majburiy; to'langan bo'lsa `Payment.status=refunded` |

**Har bir status o'zgarishida:** `OrderStatusLog` yozuvi + mijozga SMS (yoki push): "Buyurtmangiz MX-K3J9F2A1 holati: Chop etilmoqda".

### 5.6. `designData` JSON strukturasi (editor holati)

Frontend editor'dagi aynan shu struktura saqlanadi (`SpreadState[]` — `editor.vue` dan):
```json
{
  "version": 1,
  "background": "#ececec",
  "spreads": [
    {
      "id": 0,
      "leftPage": null,
      "rightPage": {
        "pageNumber": 1,
        "layoutId": "layout-magazine",
        "photoIds": ["ph_001"],
        "textTitle": "Title",
        "textContent": "Enter text",
        "background": "#ffffff",
        "stickers": [
          {
            "id": "stk_a1",
            "type": "emoji",
            "value": "✈️",
            "x": 0.42, "y": 0.31,
            "scale": 1.2,
            "rotation": 15
          }
        ]
      },
      "stickers": []
    }
  ]
}
```
> Muhim: frontend hozir `photoIndices` (massiv indekslari) ishlatadi — backendga o'tishda **`photoIds`** (server ID) ishlatiladi. `x/y` — sahifaga nisbatan 0..1 oraliqdagi nisbiy koordinatalar (print uchun masshtablanadi). Backend bu JSONni validatsiya qiladi (mavjud photoId'lar, layoutId'lar) lekin ichki strukturani o'zgartirmaydi — bu frontend "mulki".

---

## 6. ISHLASH JARAYONI (END-TO-END)

```
MIJOZ                          BACKEND                         ADMIN/XODIMLAR
─────                          ───────                         ──────────────
1. Telefon kiritadi      →  send-otp → SMS (Eskiz.uz)
2. OTP kiritadi          →  verify-otp → JWT
3. Ism kiritadi          →  complete-profile
4. Shablon tanlaydi      →  GET /templates, /templates/:id
   + sahifa soni (10/20/30)
5. Albom yaratiladi      →  POST /albums (draft)
6. Rasmlar yuklanadi     →  presign → S3 → confirm
7. "Create photo album"  →  POST /albums/:id/process
                            (AI: dublikat, sifat, tartib,
                             boshlang'ich designData)
8. Editor'da tahrirlaydi →  PUT /albums/:id/design (autosave)
9. Preview → savat       →  POST /cart/items
10. Promo-kod (8MARCH)   →  POST /cart/apply-promo
11. Checkout + rozilik   →  POST /orders → paymentUrl
12. Payme/Click to'laydi →  callback → paid → in_review  →   🔔 Yangi buyurtma!
                                                              Operator tekshiradi
                                                          →   in_progress
                                                              Printer print-PDF oladi,
                                                              chop etadi → packing
                                                              Kuryer oladi → delivering
13. Kitobni oladi                                         →   completed
    (har bosqichda SMS keladi)
14. /orders da kuzatadi  →  GET /orders?tab=active|history
```

---

## 7. BACKEND ICHKI VAZIFALARI (API bo'lmagan)

1. **Rasm pipeline:** yuklangandan keyin — thumbnail (400px), HEIC→JPEG konvert, EXIF orientatsiya tuzatish, EXIF sana o'qish.
2. **AI processing job:** perceptual hash (dublikat), Laplacian variance (blur/sifat), sana bo'yicha saralash, layout taqsimlash. Queue: BullMQ/Celery/Sidekiq — texnologiyaga qarab.
3. **Print-PDF generatsiya:** designData + original (to'liq o'lchamli) rasmlardan 300 DPI PDF, 11.5″×8.5″ + 3mm bleed. Bu eng murakkab qism — alohida servis qilish mumkin.
4. **SMS xizmati:** OTP + buyurtma status xabarlari (shablonlar 3 tilda).
5. **Draft tozalash:** 30 kun harakatsiz draft albomlar va ularning rasmlari avtomatik o'chiriladi (cron).
6. **To'lov rekonsilatsiya:** to'lanmagan `pending` buyurtmalar 24 soatdan keyin avtomatik bekor qilinadi.

---

## 8. ISHLAB CHIQISH BOSQICHLARI (TAVSIYA ETILGAN TARTIB)

| Bosqich | Nima | Frontend qaysi sahifa ulanadi |
|---|---|---|
| 1 | Auth (OTP, JWT, profile) | LoginPage, OtpPage, LoginName, AppHeader |
| 2 | Kontent: home, templates, faq, categories | index, templates, faq |
| 3 | Albums + photo upload (S3) | upload, upload/upload |
| 4 | Processing job (avval oddiy: faqat saralash) | upload/processing |
| 5 | Design save/load + editor resurslari | upload/editor, upload/preview |
| 6 | Cart + pricing + promo | cart |
| 7 | Orders + statuslar | orders, order-info |
| 8 | To'lov (Payme/Click) | cart checkout |
| 9 | Admin panel (orders birinchi!) | — |
| 10 | Print-PDF, SMS-notifikatsiyalar, AI yaxshilash | — |

---

## 9. QO'SHIMCHA ESLATMALAR FRONTENDGA MOSLIK BO'YICHA

- Frontend hozir `MX-` prefiksli orderNumber generatsiya qiladi (`MX-${Date.now()...}`) — buni **backend** qiladi, frontend faqat ko'rsatadi.
- `StoredOrder` statuslari frontendda inglizcha label ("In review") — API `status` (snake_case) + `statusLabel` (tarjima) ikkalasini qaytarsin.
- Savatda hozir narx hardcode (`$32.99 + $2.99`) — bularning hammasi `GET /products/pricing` dan kelishi kerak.
- Bannerdagi countdown (`8 mart`) hozir hardcode — `countdownTo` maydonidan olinadi.
- `clear-storage.client.ts` plugini sessiya tozalaydi — backendga o'tilgach draft'lar serverda saqlanadi va bu muammo yo'qoladi.
- CORS: frontend domeni (dev: `http://localhost:3000`) uchun ochiq bo'lsin.
