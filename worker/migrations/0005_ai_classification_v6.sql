-- V6 additive classification memory. Never overwrite existing project rows during migration.
CREATE TABLE IF NOT EXISTS search_ai_classifications_v6 (
 entity_id TEXT PRIMARY KEY REFERENCES search_entities_v3(id),
 category TEXT NOT NULL,
 reasoning TEXT NOT NULL DEFAULT '',
 tags_json TEXT NOT NULL DEFAULT '[]',
 model TEXT NOT NULL,
 input_hash TEXT NOT NULL,
 confidence REAL NOT NULL DEFAULT 0,
 source TEXT NOT NULL DEFAULT 'gemini',
 locked INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS search_ai_batches_v6 (
 object_key TEXT PRIMARY KEY,
 etag TEXT NOT NULL DEFAULT '',
 accepted_count INTEGER NOT NULL DEFAULT 0,
 rejected_count INTEGER NOT NULL DEFAULT 0,
 processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
