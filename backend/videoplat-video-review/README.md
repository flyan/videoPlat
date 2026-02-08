# VideoPlat Video Review Module

录制回放模块 - 负责会议录制文件的管理、存储、播放和下载。

## 功能特性

- 录制列表查询（支持分页和多条件筛选）
- 录制详情查看
- 视频流式播放（支持 HTTP Range 请求）
- 录制文件下载
- 录制删除（权限控制）
- 存储统计信息

## 模块结构

```
videoplat-video-review/
├── src/main/java/com/videoplat/videoreview/
│   ├── controller/
│   │   └── VideoReviewController.java      # REST API 控制器
│   ├── service/
│   │   ├── VideoReviewService.java         # 录制管理服务
│   │   └── RecordingStorageService.java    # 存储管理服务
│   ├── dto/
│   │   ├── RecordingDto.java               # 录制信息 DTO
│   │   ├── RecordingQueryRequest.java      # 查询请求 DTO
│   │   └── RecordingStatisticsDto.java     # 统计信息 DTO
│   └── config/
│       └── StorageConfig.java              # 存储配置
└── src/main/resources/
    └── application.yml                      # 模块配置
```

## API 端点

### 1. 查询录制列表
```
GET /api/v1/video-review/recordings
```

**查询参数：**
- `roomName` (可选): 会议室名称（模糊匹配）
- `startDate` (可选): 开始时间（ISO 8601 格式）
- `endDate` (可选): 结束时间（ISO 8601 格式）
- `creatorId` (可选): 创建者ID
- `page` (可选): 页码，默认 0
- `size` (可选): 每页大小，默认 20
- `sortBy` (可选): 排序字段，默认 startedAt
- `sortDirection` (可选): 排序方向（ASC/DESC），默认 DESC

**响应示例：**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "roomId": 123,
        "roomName": "技术讨论会",
        "filePath": "recording_123_20260208.mp4",
        "fileSize": 125829120,
        "fileSizeFormatted": "120.00 MB",
        "duration": 3600,
        "durationFormatted": "01:00:00",
        "resolution": "1920x1080",
        "startedAt": "2026-02-08T10:00:00",
        "endedAt": "2026-02-08T11:00:00",
        "creatorId": 1,
        "canDelete": true
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "number": 0,
    "size": 20
  }
}
```

### 2. 获取录制详情
```
GET /api/v1/video-review/recordings/{id}
```

**路径参数：**
- `id`: 录制ID

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "roomId": 123,
    "roomName": "技术讨论会",
    "filePath": "recording_123_20260208.mp4",
    "fileSize": 125829120,
    "fileSizeFormatted": "120.00 MB",
    "duration": 3600,
    "durationFormatted": "01:00:00",
    "resolution": "1920x1080",
    "startedAt": "2026-02-08T10:00:00",
    "endedAt": "2026-02-08T11:00:00",
    "creatorId": 1,
    "canDelete": true
  }
}
```

### 3. 流式播放录制
```
GET /api/v1/video-review/recordings/{id}/stream
```

**路径参数：**
- `id`: 录制ID

**请求头：**
- `Range` (可选): 字节范围，如 "bytes=0-1023"

**响应：**
- 返回视频文件流，支持 HTTP Range 请求
- Content-Type: video/mp4 或 video/webm

### 4. 下载录制
```
GET /api/v1/video-review/recordings/{id}/download
```

**路径参数：**
- `id`: 录制ID

**响应：**
- 返回视频文件，浏览器会提示下载
- Content-Disposition: attachment

### 5. 删除录制
```
DELETE /api/v1/video-review/recordings/{id}
```

**路径参数：**
- `id`: 录制ID

**权限要求：**
- 只有录制创建者和管理员可以删除

**响应示例：**
```json
{
  "success": true,
  "message": "录制删除成功"
}
```

### 6. 获取存储统计
```
GET /api/v1/video-review/statistics
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "totalRecordings": 50,
    "totalFileSize": 5368709120,
    "totalFileSizeFormatted": "5.00 GB",
    "totalDuration": 180000,
    "totalDurationFormatted": "50:00:00",
    "averageFileSize": 107374182,
    "averageFileSizeFormatted": "102.40 MB",
    "averageDuration": 3600,
    "averageDurationFormatted": "01:00:00"
  }
}
```

## 配置说明

在 `application.yml` 中配置存储参数：

```yaml
videoplat:
  storage:
    # 录制文件存储路径
    recordings-path: ./recordings
    # 最大文件大小（字节）
    max-file-size: 5368709120  # 5GB
    # 允许的文件扩展名
    allowed-extensions:
      - mp4
      - webm
      - mkv
    # 是否启用文件压缩
    enable-compression: false
```

## 权限控制

### 查看权限
- 所有登录用户可以查看所有录制

### 删除权限
- 录制创建者可以删除自己创建的录制
- 管理员可以删除任何录制

## 依赖模块

- `videoplat-common`: 通用工具类和异常处理
- `videoplat-domain`: 数据实体和仓储接口

## 使用示例

### 前端集成示例

```javascript
// 查询录制列表
async function getRecordings(page = 0, size = 20) {
  const response = await fetch(
    `/api/v1/video-review/recordings?page=${page}&size=${size}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return await response.json();
}

// 播放录制
function playRecording(recordingId) {
  const videoElement = document.getElementById('video-player');
  videoElement.src = `/api/v1/video-review/recordings/${recordingId}/stream`;
  videoElement.play();
}

// 下载录制
function downloadRecording(recordingId) {
  window.location.href = `/api/v1/video-review/recordings/${recordingId}/download`;
}

// 删除录制
async function deleteRecording(recordingId) {
  const response = await fetch(
    `/api/v1/video-review/recordings/${recordingId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return await response.json();
}
```

## 注意事项

1. **文件存储路径**：确保应用有权限读写配置的存储路径
2. **文件大小限制**：默认最大 5GB，可根据需要调整
3. **视频格式**：推荐使用 MP4 格式（H.264 + AAC）以获得最佳兼容性
4. **Range 请求**：流式播放支持 HTTP Range 请求，适合大文件播放
5. **权限验证**：所有 API 都需要用户登录（JWT Token）
6. **文件清理**：删除录制时会同时删除文件和数据库记录

## 测试

使用 Swagger UI 测试 API：
```
http://localhost:8080/swagger-ui.html
```

## 后续优化

- [ ] 实现完整的 HTTP Range 请求支持（多段范围）
- [ ] 添加视频转码功能
- [ ] 支持视频缩略图生成
- [ ] 实现视频分片上传
- [ ] 添加 CDN 集成
- [ ] 支持云存储（S3、OSS 等）
