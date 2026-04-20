@# خطة المنتج الشاملة: "المسامح كريم يا عم" 🤝

---

## 1. PRODUCT PLAN — خطة المنتج

### 🎯 الجمهور المستهدف

| الفئة | التفاصيل |
|---|---|
| الفئة الأساسية | شباب وبنات 18–35 سنة، عرب (مصر أولاً) |
| الفئة الثانوية | أي شخص عنده علاقة متوترة — صاحب، حبيب سابق، أخ، زميل |
| الفئة الثالثة | ناس بيحبوا يعبروا عن مشاعرهم بس مش عارفين يبتدوا ازاي |

---

### 😣 مشاكل المستخدمين

| المشكلة | التفاصيل |
|---|---|
| الكبرياء | صعب تبدأ إنت الأول |
| الخوف من الرفض | "لو بعتله وماردش هموت" |
| مش عارف يعبر | يحس بحاجة بس مش لاقي الكلام |
| الخوف من سوء التفسير | "هيفهم غلط وهتبقى أكبر" |
| مش عارف الثاني حاسس ايه | "هو أصلاً عايز نتصالح؟" |

---

### 💡 Value Proposition

> "المسامح كريم" هو المكان اللي ممكن فيه تبعت مشاعرك من غير ما تخاف — الـ AI بيساعدك تقول اللي جوّاك بطريقة كريمة، والتاني بيستقبلها في أمان كامل. ولو الاتنين عايزين يتصالحوا — يبقى ربنا ستر.

---

### 🗺️ User Journey — رحلة المستخدم

#### رحلة المرسِل

```
[1] بيشوف لينك صاحبه على واتساب أو انستاجرام
      ↓
[2] بيضغط — يدخل على بروفايل صاحبه
      ↓
[3] بيختار الإيموشن: (زعلان / وحشتني / عايز أصلح / ممتن)
      ↓
[4] بيكتب رسالته زي ما هي، حتى لو كانت "وحشتني يخرب بيتك"
      ↓
[5] الـ AI بيعيد صياغتها بطريقة كريمة وعرضها عليه
      ↓
[6] يقدر يعدّل أو يوافق
      ↓
[7] يختار: anonymous أو بالاسم
      ↓
[8] بيبعت ✅
```

#### رحلة المستقبِل

```
[1] بييجيله نوتيفيكيشن: "في حاجة جديدة في صندوقك"
      ↓
[2] بيفتح التطبيق — بيشوف كارت الرسالة + الإيموشن
      ↓
[3] لو الرسالة anonymous — بيشوف الرسالة بس مش الاسم
      ↓
[4] زرار "افتح كلام" — لو ضغط، بيبعت إشارة للمرسل
      ↓
[5] لو المرسل وافق — Mutual Reveal 🎉
      ↓
[6] واتساب Deep Link أو In-App Chat
```

---

### 🔁 Viral Loop Strategy

```
المستخدم يستقبل رسالة حلوة
        ↓
يشارك "صندوق المسامحة بتاعي" على Story
        ↓
ناس تانية تشوف وتبعت
        ↓
كل واحد بيفتح أكونت عشان يشوف مين بعت
        ↓
يبعت هو كمان للناس اللي وحشتوه
        ↓
الحلقة بتتكرر ♻️
```

**Viral Triggers:**
- شير Story بـ "صندوق مسامحتي مفتوح" بتصميم جميل
- رسالة واتساب جاهزة بـ Deep Link شخصي
- "عدد الناس اللي بعتولك" كـ social proof (من غير كشف)

---

### 🔐 Safety & Privacy Strategy

| المبدأ | التطبيق |
|---|---|
| الهوية اختيارية | anonymous by default |
| الكشف بالموافقة فقط | Mutual Consent فقط |
| لا ضغط | مفيش تذكيرات "مش رديت لسه؟" |
| AI Moderation | كل رسالة بتتفلتر قبل الإرسال |
| حذف ذاتي | كل رسالة anonymous بتتحذف تلقائي بعد 30 يوم |
| لا تتبع | مش بنسجل IP أو بيانات تعريفية للـ anonymous |

---

## 2. ERD — مخطط قاعدة البيانات

### Entities & Fields

#### USERS
| Field | Type | Notes |
|---|---|---|
| userId | STRING (PK) | Firebase Auth UID |
| displayName | STRING | الاسم المعروض |
| username | STRING (unique) | for link: /u/username |
| avatarUrl | STRING | صورة البروفايل |
| bio | STRING | optional |
| profileLink | STRING | generated |
| isActive | BOOLEAN | |
| notificationsEnabled | BOOLEAN | |
| createdAt | TIMESTAMP | |
| lastSeen | TIMESTAMP | |
| reportCount | NUMBER | internal moderation |
| isBanned | BOOLEAN | |

#### MESSAGES
| Field | Type | Notes |
|---|---|---|
| messageId | STRING (PK) | |
| recipientId | FK → Users | |
| senderUserId | FK → Users / null | null if anonymous |
| isAnonymous | BOOLEAN | |
| emotion | ENUM | UPSET / RECONCILE / MISS / GRATEFUL |
| originalText | STRING | encrypted, recipient never sees |
| rewrittenText | STRING | ما يشوفه المستقبل |
| aiConfidence | NUMBER | 0.0 – 1.0 |
| moderationStatus | ENUM | PENDING / APPROVED / REJECTED / FLAGGED |
| isRead | BOOLEAN | |
| isDeleted | BOOLEAN | |
| createdAt | TIMESTAMP | |
| expiresAt | TIMESTAMP | +30 days for anonymous |

#### MATCH_REQUESTS
| Field | Type | Notes |
|---|---|---|
| matchId | STRING (PK) | |
| messageId | FK → Messages | |
| initiatorId | FK → Users / null | null if anonymous |
| recipientId | FK → Users | |
| initiatorConsent | BOOLEAN | |
| recipientConsent | BOOLEAN | |
| isRevealed | BOOLEAN | |
| revealedAt | TIMESTAMP | |
| createdAt | TIMESTAMP | |
| expiresAt | TIMESTAMP | +7 days |

#### CONVERSATIONS
| Field | Type | Notes |
|---|---|---|
| convId | STRING (PK) | |
| matchId | FK → MatchRequests | |
| participant1 | FK → Users | |
| participant2 | FK → Users | |
| isActive | BOOLEAN | |
| createdAt | TIMESTAMP | |

#### CHAT_MESSAGES (subcollection of Conversations)
| Field | Type | Notes |
|---|---|---|
| chatMsgId | STRING (PK) | |
| convId | FK → Conversations | |
| senderId | FK → Users | |
| content | STRING | |
| isRead | BOOLEAN | |
| createdAt | TIMESTAMP | |

#### REPORTS
| Field | Type | Notes |
|---|---|---|
| reportId | STRING (PK) | |
| reporterId | FK → Users | |
| messageId | FK → Messages | |
| reason | ENUM | HARASSMENT / SPAM / TOXIC / OTHER |
| status | ENUM | OPEN / REVIEWED / RESOLVED |
| createdAt | TIMESTAMP | |

#### RATE_LIMITS
| Field | Type | Notes |
|---|---|---|
| identifier | STRING (PK) | IP or userId |
| action | STRING | e.g. "send_message" |
| count | NUMBER | |
| windowStart | TIMESTAMP | |

### Enums
- **Emotion:** `UPSET` | `RECONCILE` | `MISS` | `GRATEFUL`
- **ModerationStatus:** `PENDING` | `APPROVED` | `REJECTED` | `FLAGGED`
- **ReportReason:** `HARASSMENT` | `SPAM` | `TOXIC` | `OTHER`
- **ReportStatus:** `OPEN` | `REVIEWED` | `RESOLVED`

### Relationships
- User **1 → N** Messages (as recipient)
- User **1 → N** Messages (as sender, nullable)
- Message **1 → 1** MatchRequest
- MatchRequest **1 → 1** Conversation
- Conversation **1 → N** ChatMessages
- User **1 → N** Reports (as reporter)
- Message **1 → N** Reports

---

## 3. Firebase Firestore Structure

```
firestore/
│
├── users/
│   └── {userId}/
│       ├── displayName: "أحمد"
│       ├── username: "ahmed_m"
│       ├── profileLink: "masameh.app/u/ahmed_m"
│       ├── avatarUrl: "https://..."
│       ├── bio: "بحب الناس وبكره الخناقات"
│       ├── isActive: true
│       ├── isBanned: false
│       ├── reportCount: 0
│       ├── notificationsEnabled: true
│       ├── createdAt: Timestamp
│       └── lastSeen: Timestamp
│
├── messages/
│   └── {messageId}/
│       ├── recipientId: "userId_abc"
│       ├── senderUserId: null        ← null if anonymous
│       ├── isAnonymous: true
│       ├── emotion: "MISS"
│       ├── originalText: "وحشتني يا زفت"   ← encrypted, hidden from recipient
│       ├── rewrittenText: "والله وحشتني كتير"
│       ├── aiConfidence: 0.94
│       ├── moderationStatus: "APPROVED"
│       ├── isRead: false
│       ├── isDeleted: false
│       ├── createdAt: Timestamp
│       └── expiresAt: Timestamp      ← +30 days for anonymous
│
├── matchRequests/
│   └── {matchId}/
│       ├── messageId: "msg_xyz"
│       ├── initiatorId: null         ← anonymous sender
│       ├── recipientId: "userId_abc"
│       ├── initiatorConsent: false
│       ├── recipientConsent: true
│       ├── isRevealed: false
│       ├── createdAt: Timestamp
│       └── expiresAt: Timestamp      ← +7 days
│
├── conversations/
│   └── {convId}/
│       ├── matchId: "match_123"
│       ├── participants: ["userId_abc", "userId_xyz"]
│       ├── isActive: true
│       ├── createdAt: Timestamp
│       │
│       └── messages/  ← subcollection
│           └── {chatMsgId}/
│               ├── senderId: "userId_abc"
│               ├── content: "يسطا مش متخيل إنك انت اللي بعتت"
│               ├── isRead: false
│               └── createdAt: Timestamp
│
├── reports/
│   └── {reportId}/
│       ├── reporterId: "userId_abc"
│       ├── messageId: "msg_xyz"
│       ├── reason: "HARASSMENT"
│       ├── status: "OPEN"
│       └── createdAt: Timestamp
│
└── rateLimits/
    └── {identifier}/  ← IP or userId
        ├── action: "send_message"
        ├── count: 3
        └── windowStart: Timestamp
```

---

## 4. API & Backend Logic

### 📨 Message Creation Flow

```
POST /api/messages/send

1. Validate recipient username → get recipientId
2. Check rate limit (max 5 msgs/IP/hour to same recipient)
3. Save originalText (encrypted, recipient never sees it)
4. Call AI Rewrite API → get rewrittenText
5. Run moderation check → moderationStatus
6. If REJECTED → return error with soft explanation
7. If APPROVED → save to Firestore
8. Trigger push notification to recipient
9. Return { messageId, rewrittenText, status }
```

### 🤖 AI Rewriting Flow

```
Input:
  - originalText: "أنا زعلان منك ومش قادر أسامحك"
  - emotion: "UPSET"
  - isAnonymous: true

Step 1: Moderation Check (fast)
  → Claude Haiku / GPT-4o-mini
  → Prompt: "هل الرسالة دي فيها إيذاء أو تحرش؟"
  → Returns: { safe: true/false, reason: "..." }

Step 2: Rewrite (if safe)
  → Claude Sonnet
  → Returns: { rewrittenText, confidence }

Step 3: Second moderation on rewritten text
  → Confirm output is clean

Step 4: Return to user for review before sending
```

### 💞 Match Logic — Mutual Consent

```
Scenario A (Anonymous):
  1. المستقبل يضغط "افتح كلام" على رسالة anonymous
  2. بيتبعت notification للـ anonymous sender
     (من غير ما يتكشف هوية المستقبل)
  3. لو Anonymous Sender وافق → matchRequest.initiatorConsent = true
  4. لو initiatorConsent && recipientConsent → isRevealed = true
  5. اتنينهم بيشوفوا الاسم + زرار واتساب / Chat

Scenario B (Known sender):
  1. المستقبل يضغط "افتح كلام"
  2. مباشرة بيتفتح Chat أو واتساب

Rules:
  - مفيش reveal من طرف واحد
  - لو المرسل anonymous ومتسجلش — مفيش reveal أبداً
  - Match Request بتنتهي بعد 7 أيام من غير رد
```

### 📱 WhatsApp Deep Link Logic

```javascript
// When phone number is available after reveal
function generateWhatsAppLink(recipientPhone, matchContext) {
  const message = encodeURIComponent(
    `يسطا المسامح كريم 🤝 — اتصلي بيا لما تعدي عليك فرصة`
  );
  return `https://wa.me/${recipientPhone}?text=${message}`;
}

// Share your own inbox link (no phone needed)
function generateShareLink(username) {
  const text = encodeURIComponent(
    `📬 عندي صندوق مسامحة — لو عندك كلام تقوله:\nmasameh.app/u/${username}`
  );
  return `https://wa.me/?text=${text}`;
}
```

---

## 5. AI Integration

### أين يُستخدم الذكاء الاصطناعي

| الوظيفة | النموذج المقترح | الهدف |
|---|---|---|
| إعادة صياغة الرسالة | Claude Sonnet | تحويل النص لكلام كريم |
| فلترة المحتوى | Claude Haiku (سريع) | كشف التوكسيك |
| تصنيف الإيموشن | Claude Haiku | تأكيد الإيموشن المختار |
| اقتراح رد | Claude Sonnet | مساعدة المستقبل في الرد |

### 🧠 Prompt Strategy

**Prompt: إعادة الصياغة**
```
أنت مساعد متخصص في الصالحة والتعبير العاطفي اللطيف.
مهمتك: حوّل الرسالة التالية لرسالة كريمة وصادقة،
مكتوبة بالعربي المصري البسيط، من غير ما تغير المعنى الأساسي.

قواعد صارمة:
- لا كلمات جارحة أو اتهامات
- لا مبالغة في التزلف
- حافظ على نبرة صادقة وإنسانية
- الطول: من 1 لـ 3 جمل بس
- الإيموشن الأصلي: {emotion}

الرسالة الأصلية:
"{originalText}"

اكتب الرسالة المعادة صياغتها فقط، من غير أي مقدمة أو تفسير.
```

**Prompt: Moderation**
```
أنت نظام فلترة محتوى لتطبيق مصالحة اجتماعي.
افحص الرسالة دي وقرر:
1. هل فيها تهديد؟
2. هل فيها تحرش جنسي؟
3. هل فيها إهانة شخصية مقصودة؟
4. هل فيها كلام عنصري أو طائفي؟

رسالة: "{text}"

رد بـ JSON فقط:
{ "safe": true/false, "reason": "..." }
```

---

## 6. Safety System

### 🛡️ طبقات الحماية

```
Layer 1: Rate Limiting
  ├── Max 5 messages per IP per hour to same recipient
  ├── Max 20 messages per IP per day (total)
  └── Exponential backoff after violations

Layer 2: AI Moderation (Pre-send)
  ├── Toxicity detection
  ├── Sexual content detection
  ├── Threat detection
  └── Spam detection

Layer 3: Post-send Reporting
  ├── "بلّغ عن الرسالة دي" button
  ├── Categories: مزعج / مسيء / تحرش / أخرى
  └── Auto-escalation if user gets 3+ reports

Layer 4: Account Protection
  ├── بعد 3 بلاغات: مراجعة يدوية
  ├── بعد 5 بلاغات: حظر مؤقت
  └── بعد تأكيد الإساءة: حظر دائم

Layer 5: Data Minimization
  ├── Anonymous = no IP stored after send
  ├── Original text encrypted (AES-256)
  ├── Auto-delete messages after 30 days
  └── No tracking pixels or analytics on profile views
```

### 🚨 Reporting Flow

```
User clicks "بلّغ"
    ↓
Choose reason (UI)
    ↓
Report saved to Firestore
    ↓
If reason = HARASSMENT → immediate soft-block of sender
    ↓
Admin review queue (Dashboard)
    ↓
Action: warn / ban / dismiss
    ↓
Notification to reporter: "شكراً، اتعمل اللازم"
```

---

## 7. UX Writing — Arabic (Egyptian Dialect)

### 🚀 Onboarding

**شاشة 1**
- العنوان: "المسامح كريم يا عم 🤝"
- النص: "في ناس وحشتك؟ في حاجة عايز تقولها بس مش عارف تبتدي؟ احنا هنساعدك."
- زرار: "يلا نبدأ"

**شاشة 2**
- العنوان: "صندوق مسامحتك الخاص"
- النص: "هيبقى ليك لينك خاص — الناس تبعتلك فيه مشاعرها بأمان وبدون إحراج."
- زرار: "عايز أفهم أكتر"

**شاشة 3**
- العنوان: "الـ AI بيحوّل الكلام الجامد"
- النص: "حتى لو الرسالة فيها زعل — هنحولها لكلام كريم من غير ما يضيع المعنى."
- زرار: "انشئ حسابي"

---

### 🏷️ Button Labels

| الوظيفة | النص |
|---|---|
| إرسال رسالة | "ابعت كلامك" |
| الموافقة على الصياغة | "تمام كده، ابعت" |
| تعديل الرسالة | "عايز أعدّل" |
| فتح المحادثة | "افتح كلام 💬" |
| مشاركة اللينك | "شارك صندوقك" |
| حذف الرسالة | "امسح الرسالة دي" |
| الإبلاغ | "بلّغ عن الرسالة" |
| الموافقة على الكشف | "آه، عايز أعرف مين" |
| الرفض | "لأ، خليها سر" |
| إرسال واتساب | "كلمني على واتساب 📲" |

---

### 📭 Empty States

**صندوق فاضي:**
> "لسه مفيش رسائل 📬
> شارك لينكك وشوف مين واحشهم."
> [زرار: "شارك دلوقتي"]

**بعد إرسال رسالة:**
> "الرسالة اتبعتت ✅
> ربنا يسهلها — والمسامح كريم."

**لما التكشف ما يحصلش:**
> "المرسل مش جاهز دلوقتي.
> مش مشكلة — الكلام الكويس بيلاقي طريقه."

**بعد حظر رسالة:**
> "الرسالة دي فيها حاجة مش كويسة 🚫
> اكتب بقلبك مش بزعلك — وهنبعتها."

---

### 🔔 Notifications

| الحدث | النص |
|---|---|
| رسالة جديدة | "📬 حد بعتلك رسالة — افتح وشوف" |
| طلب فتح كلام | "💬 حد عايز يعرفك — عايز تعرفه؟" |
| Mutual Reveal | "🎉 اتصالحتوا! دلوقتي تقدروا تتكلموا." |
| تذكير لطيف (مرة واحدة) | "عندك رسالة لسه ما قريتهاش 📬" |

---

## 8. Monetization Ideas 💰

### المرحلة الأولى: مجاني 100%
ركّز على الانتشار قبل أي حاجة تانية.

### المرحلة التانية: Freemium

| الفيتشر | مجاني | بريميوم |
|---|---|---|
| استقبال رسائل | ✅ غير محدود | ✅ |
| إرسال رسائل | 5 يوميًا | غير محدود |
| اختيار تصميم الصندوق | 3 تصاميم | 20+ تصميم |
| إخفاء "Powered by Masameh" | ❌ | ✅ |
| إحصائيات الصندوق | ❌ | ✅ |
| أولوية في المراجعة | ❌ | ✅ |

**السعر المقترح:** 29 جنيه / شهر أو 199 جنيه / سنة

### المرحلة التالتة: B2B (اختياري)
- نسخة للـ HR: صندوق مسامحة بين الزملاء
- نسخة للمدارس: بين الطلاب والمعلمين
- White-label للعلامات التجارية العاطفية

---

## 🏗️ Technical Stack المقترح

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS + Framer Motion |
| Backend | Firebase (Auth, Firestore, Functions, Storage) |
| AI | Anthropic Claude API (Sonnet للصياغة، Haiku للفلترة) |
| Hosting | Vercel |
| Notifications | Firebase Cloud Messaging |
| Analytics | PostHog (privacy-first) |
| Rate Limiting | Firebase + Upstash Redis |

---

## 🗓️ Roadmap

### MVP — 6 أسابيع
- ✅ Profile Link
- ✅ Send Message (anonymous)
- ✅ AI Rewrite
- ✅ Basic Moderation
- ✅ WhatsApp Share

### v1.1 — شهرين
- ✅ Mutual Consent Reveal
- ✅ In-App Chat
- ✅ Push Notifications
- ✅ Reporting System

### v2.0 — 4 شهور
- ✅ Freemium Model
- ✅ Profile Customization
- ✅ Analytics Dashboard
- ✅ B2B Version

framework next.js and use tost and model 
---

> 💡 **الفكرة الجوهرية:** "المسامح كريم" مش مجرد تطبيق — هو **أداة شجاعة هادية**. بيخلي الواحد يقول اللي جوّاه من غير ما يخاف، ويستقبل المشاعر من غير ما يتجرح. ده هو الفرق.
