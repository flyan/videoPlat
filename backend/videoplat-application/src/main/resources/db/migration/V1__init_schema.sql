-- =====================================================
-- VideoPlat 数据库初始化脚本
-- 版本: V1
-- 描述: 创建核心业务表（用户、会议室、参与者、录制）
-- =====================================================

-- =====================================================
-- 用户表 (users)
-- 支持注册用户和游客两种类型
-- =====================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    nickname VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    user_type VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    online_status VARCHAR(20) DEFAULT 'OFFLINE',
    last_active_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 用户表注释
COMMENT ON TABLE users IS '用户表，支持注册用户和游客';
COMMENT ON COLUMN users.id IS '用户ID，主键';
COMMENT ON COLUMN users.username IS '用户名，唯一标识';
COMMENT ON COLUMN users.password_hash IS '密码哈希值，游客用户为空';
COMMENT ON COLUMN users.nickname IS '昵称，显示名称';
COMMENT ON COLUMN users.avatar_url IS '头像URL';
COMMENT ON COLUMN users.user_type IS '用户类型：REGISTERED-注册用户, GUEST-游客';
COMMENT ON COLUMN users.role IS '用户角色：ADMIN-管理员, USER-普通用户, GUEST-游客';
COMMENT ON COLUMN users.online_status IS '在线状态：ONLINE-在线, OFFLINE-离线, BUSY-忙碌（在会议中）';
COMMENT ON COLUMN users.last_active_at IS '最后活跃时间';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';

-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- 会议室表 (rooms)
-- 支持最多 10 人同时在线，可设置密码保护
-- =====================================================
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL UNIQUE,
    room_name VARCHAR(200) NOT NULL,
    creator_id BIGINT NOT NULL,
    password_hash VARCHAR(255),
    max_participants INTEGER NOT NULL DEFAULT 10,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    CONSTRAINT fk_rooms_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 会议室表注释
COMMENT ON TABLE rooms IS '会议室表，支持最多10人同时在线';
COMMENT ON COLUMN rooms.id IS '会议室数据库ID，主键';
COMMENT ON COLUMN rooms.room_id IS '会议室唯一标识符，用于加入会议';
COMMENT ON COLUMN rooms.room_name IS '会议室名称';
COMMENT ON COLUMN rooms.creator_id IS '创建者用户ID';
COMMENT ON COLUMN rooms.password_hash IS '会议室密码哈希值，为空表示无密码';
COMMENT ON COLUMN rooms.max_participants IS '最大参与人数，默认10人';
COMMENT ON COLUMN rooms.status IS '会议室状态：ACTIVE-进行中, ENDED-已结束';
COMMENT ON COLUMN rooms.created_at IS '创建时间';
COMMENT ON COLUMN rooms.ended_at IS '结束时间';

-- 会议室表索引
CREATE INDEX idx_rooms_room_id ON rooms(room_id);
CREATE INDEX idx_rooms_creator_id ON rooms(creator_id);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);

-- =====================================================
-- 会议室参与者表 (room_participants)
-- 记录用户加入和离开会议室的时间
-- =====================================================
CREATE TABLE room_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_participants_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_participants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 会议室参与者表注释
COMMENT ON TABLE room_participants IS '会议室参与者表，记录用户加入和离开会议的时间';
COMMENT ON COLUMN room_participants.id IS '参与记录ID，主键';
COMMENT ON COLUMN room_participants.room_id IS '会议室ID';
COMMENT ON COLUMN room_participants.user_id IS '用户ID';
COMMENT ON COLUMN room_participants.joined_at IS '加入时间';
COMMENT ON COLUMN room_participants.left_at IS '离开时间，为空表示仍在会议中';
COMMENT ON COLUMN room_participants.is_host IS '是否为主持人，会议室创建者默认为主持人';

-- 会议室参与者表索引
CREATE INDEX idx_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_participants_joined_at ON room_participants(joined_at);
CREATE UNIQUE INDEX idx_participants_room_user_active ON room_participants(room_id, user_id) WHERE left_at IS NULL;

-- =====================================================
-- 录制表 (recordings)
-- 存储会议录制文件的元数据信息
-- =====================================================
CREATE TABLE recordings (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    room_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    duration INTEGER,
    resolution VARCHAR(20),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    creator_id BIGINT NOT NULL,
    CONSTRAINT fk_recordings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_recordings_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 录制表注释
COMMENT ON TABLE recordings IS '会议录制表，存储录制文件的元数据信息';
COMMENT ON COLUMN recordings.id IS '录制记录ID，主键';
COMMENT ON COLUMN recordings.room_id IS '会议室ID';
COMMENT ON COLUMN recordings.room_name IS '会议室名称';
COMMENT ON COLUMN recordings.file_path IS '录制文件存储路径';
COMMENT ON COLUMN recordings.file_size IS '文件大小（字节）';
COMMENT ON COLUMN recordings.duration IS '录制时长（秒）';
COMMENT ON COLUMN recordings.resolution IS '视频分辨率，如 1280x720 或 1920x1080';
COMMENT ON COLUMN recordings.started_at IS '录制开始时间';
COMMENT ON COLUMN recordings.ended_at IS '录制结束时间';
COMMENT ON COLUMN recordings.creator_id IS '录制创建者用户ID';

-- 录制表索引
CREATE INDEX idx_recordings_room_id ON recordings(room_id);
CREATE INDEX idx_recordings_creator_id ON recordings(creator_id);
CREATE INDEX idx_recordings_started_at ON recordings(started_at);
