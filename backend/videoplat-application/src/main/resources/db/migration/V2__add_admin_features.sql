-- =====================================================
-- VideoPlat 管理台功能增强脚本
-- 版本: V2
-- 描述: 添加管理操作日志表和性能优化索引
-- =====================================================

-- =====================================================
-- 管理操作日志表 (admin_operation_logs)
-- 记录管理员的所有操作，用于审计和追踪
-- =====================================================
CREATE TABLE admin_operation_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    admin_username VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    target_user_id BIGINT,
    target_room_id BIGINT,
    operation_detail TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_logs_target_user FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_admin_logs_target_room FOREIGN KEY (target_room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 管理操作日志表注释
COMMENT ON TABLE admin_operation_logs IS '管理操作日志表，记录管理员的所有操作用于审计';
COMMENT ON COLUMN admin_operation_logs.id IS '日志记录ID，主键';
COMMENT ON COLUMN admin_operation_logs.admin_id IS '管理员用户ID';
COMMENT ON COLUMN admin_operation_logs.admin_username IS '管理员用户名';
COMMENT ON COLUMN admin_operation_logs.operation_type IS '操作类型：FORCE_OFFLINE-强制下线, CLOSE_ROOM-关闭会议室, DELETE_RECORDING-删除录制';
COMMENT ON COLUMN admin_operation_logs.target_user_id IS '目标用户ID（如果操作涉及用户）';
COMMENT ON COLUMN admin_operation_logs.target_room_id IS '目标会议室ID（如果操作涉及会议室）';
COMMENT ON COLUMN admin_operation_logs.operation_detail IS '操作详情，JSON格式存储额外信息';
COMMENT ON COLUMN admin_operation_logs.ip_address IS '操作者IP地址';
COMMENT ON COLUMN admin_operation_logs.created_at IS '操作时间';

-- 管理操作日志表索引
CREATE INDEX idx_admin_logs_admin_id ON admin_operation_logs(admin_id);
CREATE INDEX idx_admin_logs_operation_type ON admin_operation_logs(operation_type);
CREATE INDEX idx_admin_logs_target_user_id ON admin_operation_logs(target_user_id);
CREATE INDEX idx_admin_logs_target_room_id ON admin_operation_logs(target_room_id);
CREATE INDEX idx_admin_logs_created_at ON admin_operation_logs(created_at DESC);

-- =====================================================
-- 为现有表添加管理台功能所需的索引
-- 提高查询性能
-- =====================================================

-- 用户表：添加在线状态和角色索引（用于管理台用户列表筛选）
CREATE INDEX idx_users_online_status ON users(online_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_last_active_at ON users(last_active_at DESC);

-- 会议室表：添加状态索引（用于管理台会议室列表筛选）
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_ended_at ON rooms(ended_at DESC);

-- 录制表：添加结束时间索引（用于管理台录制列表排序）
CREATE INDEX idx_recordings_ended_at ON recordings(ended_at DESC);

-- =====================================================
-- 添加约束检查
-- 确保数据完整性
-- =====================================================

-- 用户表：确保角色值有效
ALTER TABLE users ADD CONSTRAINT chk_users_role
    CHECK (role IN ('ADMIN', 'USER', 'GUEST'));

-- 用户表：确保在线状态值有效
ALTER TABLE users ADD CONSTRAINT chk_users_online_status
    CHECK (online_status IN ('ONLINE', 'OFFLINE', 'BUSY'));

-- 用户表：确保用户类型值有效
ALTER TABLE users ADD CONSTRAINT chk_users_user_type
    CHECK (user_type IN ('REGISTERED', 'GUEST'));

-- 会议室表：确保状态值有效
ALTER TABLE rooms ADD CONSTRAINT chk_rooms_status
    CHECK (status IN ('ACTIVE', 'ENDED'));

-- 会议室表：确保最大参与人数合理
ALTER TABLE rooms ADD CONSTRAINT chk_rooms_max_participants
    CHECK (max_participants > 0 AND max_participants <= 100);

-- 管理操作日志表：确保操作类型值有效
ALTER TABLE admin_operation_logs ADD CONSTRAINT chk_admin_logs_operation_type
    CHECK (operation_type IN ('FORCE_OFFLINE', 'CLOSE_ROOM', 'DELETE_RECORDING'));

-- 录制表：确保文件大小和时长为正数
ALTER TABLE recordings ADD CONSTRAINT chk_recordings_file_size
    CHECK (file_size IS NULL OR file_size > 0);

ALTER TABLE recordings ADD CONSTRAINT chk_recordings_duration
    CHECK (duration IS NULL OR duration > 0);
