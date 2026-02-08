-- 添加 Agora 云端录制相关字段
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS agora_resource_id VARCHAR(255);
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS agora_sid VARCHAR(255);
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'STARTING';

-- 更新现有记录的状态
UPDATE recordings SET status = 'COMPLETED' WHERE ended_at IS NOT NULL AND status IS NULL;
UPDATE recordings SET status = 'RECORDING' WHERE ended_at IS NULL AND status IS NULL;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_recordings_status ON recordings(status);
CREATE INDEX IF NOT EXISTS idx_recordings_agora_sid ON recordings(agora_sid);
