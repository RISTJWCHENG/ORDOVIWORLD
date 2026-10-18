-- V4 additive media and provenance. Keep existing V3 entities and review decisions.
CREATE TABLE IF NOT EXISTS search_project_details_v4 (
 entity_id TEXT PRIMARY KEY REFERENCES search_entities_v3(id),
 logo_url TEXT NOT NULL DEFAULT '', logo_key TEXT NOT NULL DEFAULT '',
 github_url TEXT NOT NULL DEFAULT '', website_status TEXT NOT NULL DEFAULT 'unchecked',
 website_checked_at TEXT NOT NULL DEFAULT '', category_source TEXT NOT NULL DEFAULT '',
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS search_project_canisters_v4 (
 entity_id TEXT NOT NULL REFERENCES search_entities_v3(id),
 canister_id TEXT NOT NULL, role TEXT NOT NULL,
 PRIMARY KEY(entity_id,canister_id,role)
);
CREATE INDEX IF NOT EXISTS idx_canister_v4 ON search_project_canisters_v4(canister_id);
CREATE TABLE IF NOT EXISTS search_project_media_v4 (
 entity_id TEXT NOT NULL REFERENCES search_entities_v3(id),
 media_type TEXT NOT NULL, original_url TEXT NOT NULL DEFAULT '',
 r2_key TEXT NOT NULL DEFAULT '', mime_type TEXT NOT NULL DEFAULT '',
 content_hash TEXT NOT NULL DEFAULT '', observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(entity_id,media_type)
);
