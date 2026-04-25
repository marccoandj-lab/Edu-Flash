
# 🗄️ Edu-Flash Database Schemas (v2.0)

## 👤 Collection: `users`
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Unique identifier |
| `plan` | "freemium" \| "pro" | Current user plan |
| `api_calls_left` | number | Remaining AI calls for current period |
| `api_calls_total_used` | number | Lifetime usage counter |
| `last_reset_date` | timestamp | Last time quota was refreshed |
| `wins` | number | Game wins counter |
| `games_played` | number | Total games played |
| `total_capital` | number | Accumulated game capital |
| `character_usage` | jsonb | Stats for each character used |
| `plan_privileges` | object | See Plan Matrix below |

### 💎 Plan Matrix (Hardcoded logic in API Service)
| Privilege | Freemium | Pro |
|-----------|----------|-----|
| **Monthly Quota** | 50 calls | 500 calls |
| **Max Cards/Scan** | 10 cards | Unlimited (4,000 tokens) |
| **AI Engine** | Llama 3.2 (Stable) | Llama 4 Scout (Advanced) |
| **Priority** | Standard | High Priority |
| **Support** | Community | Priority Email |

---

## 📸 Collection: `scans`
Stores file metadata for audit logs.
- `id`: string
- `uid`: string (ref users)
- `fileName`: string
- `fileType`: "image" | "text"
- `status`: "success" | "failed"
- `createdAt`: timestamp

## 🃏 Collection: `flashcards`
- `id`: string
- `uid`: string (ref users)
- `question`: string
- `answer`: string
- `plan_at_creation`: "freemium" | "pro"
- `next_review`: timestamp
- `ease_factor`: number (SM-2)
- `interval_days`: number (SM-2)
- `correct_count`: number
- `wrong_count`: number
- `created_at`: timestamp
