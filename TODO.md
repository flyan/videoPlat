# VideoPlat 后端改进计划

> 基于代码审查生成的改进待办事项列表
> 生成日期：2026-02-08

---

## 📋 改进优先级说明

- 🔴 **高优先级**：影响安全性、性能或核心功能的问题
- 🟡 **中优先级**：影响代码质量、可维护性的问题
- 🟢 **低优先级**：优化项，可以逐步完善

---

## 🔴 高优先级改进

### 1. 安全性增强

#### 1.1 JWT 配置优化
- [ ] 修改 `application.yml` 中的 JWT 密钥配置
  - 移除默认密钥，强制从环境变量读取
  - 使用至少 256 位的强密钥
  - 文件位置：`backend/src/main/resources/application.yml:57`

- [ ] 实现 Refresh Token 机制
  - 创建 `RefreshToken` 实体类
  - 在 `JwtService.java` 中添加刷新逻辑
  - 添加 `/api/auth/refresh` 端点
  - 文件位置：`backend/src/main/java/com/videoplat/service/JwtService.java`

- [ ] 改进 Token 验证
  - 添加签名验证异常处理
  - 区分不同类型的 JWT 异常
  - 文件位置：`backend/src/main/java/com/videoplat/service/JwtService.java:80-83`

#### 1.2 权限控制完善
- [ ] 在 JWT Token 中添加权限信息
  - 修改 `generateToken` 方法添加 roles/permissions
  - 文件位置：`backend/src/main/java/com/videoplat/service/JwtService.java`

- [ ] 改进认证过滤器
  - 从 Token 中提取权限信息
  - 设置到 `UsernamePasswordAuthenticationToken` 中
  - 文件位置：`backend/src/main/java/com/videoplat/security/JwtAuthenticationFilter.java:43-47`

- [ ] 添加基于角色的访问控制
  - 在控制器方法上添加 `@PreAuthorize` 注解
  - 区分普通用户和会议室主持人权限

#### 1.3 CORS 配置优化
- [ ] 明确指定允许的请求头
  - 替换 `allowedHeaders("*")` 为具体的请求头列表
  - 文件位置：`backend/src/main/java/com/videoplat/config/CorsConfig.java:16`

- [ ] 动态配置允许的源
  - 从配置文件读取允许的域名
  - 支持生产环境配置
  - 文件位置：`backend/src/main/java/com/videoplat/config/CorsConfig.java:13`

### 2. 性能优化

#### 2.1 解决 N+1 查询问题
- [ ] 优化参与者列表查询
  - 使用 JOIN 查询一次性获取用户信息
  - 创建自定义 Repository 方法
  - 文件位置：`backend/src/main/java/com/videoplat/service/RoomService.java:155-165`

```java
// 建议的实现
@Query("SELECT new com.videoplat.dto.ParticipantDto(" +
       "p.id, u.id, u.nickname, u.avatarUrl, p.isHost, p.joinedAt) " +
       "FROM RoomParticipant p " +
       "JOIN User u ON p.userId = u.id " +
       "WHERE p.roomId = :roomId AND p.leftAt IS NULL")
List<ParticipantDto> findParticipantsByRoomId(@Param("roomId") Long roomId);
```

#### 2.2 添加 Redis 缓存
- [ ] 配置 Spring Cache
  - 添加 `@EnableCaching` 注解
  - 配置 Redis 作为缓存提供者
  - 文件位置：`backend/src/main/java/com/videoplat/config/`

- [ ] 缓存用户信息
  - 在 `UserService` 中添加 `@Cacheable` 注解
  - 设置合理的过期时间

- [ ] 缓存会议室信息
  - 在 `RoomService.getRoomInfo()` 添加缓存
  - 在更新/删除时清除缓存（`@CacheEvict`）
  - 文件位置：`backend/src/main/java/com/videoplat/service/RoomService.java`

- [ ] 缓存 Agora Token
  - 避免频繁生成 Token
  - 设置过期时间略短于 Token 有效期

#### 2.3 添加分页支持
- [ ] 录制列表分页
  - 修改 `RecordingRepository` 返回 `Page<Recording>`
  - 在控制器中接收分页参数
  - 文件位置：`backend/src/main/java/com/videoplat/service/RecordingService.java:85-90`

- [ ] 会议室列表分页（如果需要）
  - 添加获取所有会议室的接口
  - 支持分页和排序

#### 2.4 添加数据库索引
- [ ] 在实体类中添加索引注解
  - `RoomParticipant.roomId` - 常用于查询参与者
  - `RoomParticipant.userId` - 常用于查询用户参与的会议
  - `Recording.roomId` - 常用于查询会议录制
  - `Room.status` - 常用于查询活跃会议室

```java
// 示例
@Entity
@Table(name = "room_participants", indexes = {
    @Index(name = "idx_room_id", columnList = "room_id"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
public class RoomParticipant { }
```

### 3. 代码质量提升

#### 3.1 改进异常处理
- [ ] 创建自定义异常类
  - `BusinessException` - 业务逻辑异常
  - `ResourceNotFoundException` - 资源不存在
  - `UnauthorizedException` - 未授权
  - `ValidationException` - 验证失败
  - 文件位置：`backend/src/main/java/com/videoplat/exception/`

- [ ] 改进全局异常处理器
  - 区分不同类型的异常，返回不同的 HTTP 状态码
  - 返回详细的验证错误信息
  - 移除 `printStackTrace()`，使用日志框架
  - 文件位置：`backend/src/main/java/com/videoplat/exception/GlobalExceptionHandler.java`

```java
// 建议的实现
@ExceptionHandler(BusinessException.class)
public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
    log.warn("Business exception: {}", ex.getMessage());
    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ex.getMessage()));
}

@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
    log.warn("Resource not found: {}", ex.getMessage());
    return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
}
```

#### 3.2 统一日志记录
- [ ] 在所有服务类中添加 `@Slf4j` 注解
  - 替换现有的 `Logger` 声明
  - 文件位置：所有 Service 类

- [ ] 添加关键操作日志
  - 用户登录/注册
  - 创建/加入/离开会议室
  - 开始/停止录制
  - 格式：`log.info("User {} joined room {}", userId, roomId)`

- [ ] 添加错误日志
  - 在 catch 块中记录详细的错误信息
  - 包含上下文信息（用户ID、会议室ID等）

#### 3.3 消除代码重复
- [ ] 提取 userId 解析逻辑
  - 创建 `SecurityUtils` 工具类
  - 提供 `getCurrentUserId()` 方法
  - 在控制器中使用
  - 文件位置：多个控制器中重复出现

```java
// 建议的实现
public class SecurityUtils {
    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("未登录");
        }
        return Long.parseLong(auth.getName());
    }
}
```

- [ ] 统一 DTO 转换
  - 创建 `DtoConverter` 工具类或使用 MapStruct
  - 提取重复的转换逻辑
  - 文件位置：`RoomService.java:194-223`

#### 3.4 添加输入验证
- [ ] 完善 DTO 验证注解
  - `JoinRoomRequest.password` 添加 `@Size` 验证
  - 其他 DTO 添加必要的验证
  - 文件位置：`backend/src/main/java/com/videoplat/dto/`

- [ ] 添加业务逻辑验证
  - 验证用户是否已在会议室中
  - 验证会议室人数限制
  - 验证会议室状态
  - 文件位置：`RoomService.java`

---

## 🟡 中优先级改进

### 4. 功能完善

#### 4.1 实现 WebSocket 信令
- [ ] 创建 WebSocket 配置类
  - 配置 WebSocket 端点：`/ws/signaling`
  - 配置 STOMP 消息代理
  - 文件位置：`backend/src/main/java/com/videoplat/config/WebSocketConfig.java`

- [ ] 创建信令控制器
  - 处理用户加入/离开通知
  - 处理音视频状态变化
  - 处理录制状态通知
  - 文件位置：`backend/src/main/java/com/videoplat/controller/SignalingController.java`

- [ ] 实现实时通知
  - 用户加入会议室时通知其他参与者
  - 用户离开时通知
  - 录制开始/停止时通知
  - 文件位置：`RoomService.java` 中调用 WebSocket 发送消息

```java
// 建议的实现
@MessageMapping("/room/{roomId}/join")
@SendTo("/topic/room/{roomId}")
public SignalingMessage handleJoin(@DestinationVariable String roomId, Principal principal) {
    // 处理加入逻辑
    return new SignalingMessage("USER_JOINED", userId, nickname);
}
```

#### 4.2 添加审计日志
- [ ] 创建审计日志实体
  - 记录操作类型、操作人、操作时间、操作内容
  - 文件位置：`backend/src/main/java/com/videoplat/model/AuditLog.java`

- [ ] 使用 AOP 记录关键操作
  - 创建审计切面
  - 自动记录 CRUD 操作
  - 文件位置：`backend/src/main/java/com/videoplat/aspect/AuditAspect.java`

#### 4.3 添加 API 速率限制
- [ ] 集成 Bucket4j 或 Resilience4j
  - 添加依赖
  - 配置速率限制规则

- [ ] 创建速率限制拦截器
  - 限制每个用户的请求频率
  - 限制每个 IP 的请求频率
  - 返回 429 Too Many Requests

### 5. API 设计改进

#### 5.1 统一 API 路径
- [ ] 所有 API 使用 `/api/v1/` 前缀
  - 修改 `RecordingController` 的 `@RequestMapping`
  - 确保所有控制器路径一致
  - 文件位置：所有控制器

#### 5.2 修正 HTTP 方法
- [ ] 停止录制使用 PUT 或 PATCH
  - 修改 `@PostMapping` 为 `@PutMapping`
  - 文件位置：`RecordingController.java:40-48`

#### 5.3 改进响应格式
- [ ] 扩展 `ApiResponse` 类
  - 添加 `errorCode` 字段（用于客户端判断错误类型）
  - 添加 `timestamp` 字段
  - 添加 `path` 字段（请求路径）
  - 文件位置：`backend/src/main/java/com/videoplat/dto/ApiResponse.java`

```java
// 建议的实现
@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private Boolean success;
    private String message;
    private T data;
    private String errorCode;  // 新增
    private Long timestamp;    // 新增
    private String path;       // 新增
}
```

- [ ] 统一验证错误响应格式
  - 返回详细的字段验证错误
  - 文件位置：`GlobalExceptionHandler.java:24-36`

### 6. 数据库优化

#### 6.1 优化事务管理
- [ ] 审查事务范围
  - 确保事务范围最小化
  - 避免在事务中执行耗时操作
  - 文件位置：所有 Service 类

- [ ] 指定事务隔离级别
  - 根据业务需求设置隔离级别
  - 例如：`@Transactional(isolation = Isolation.READ_COMMITTED)`

#### 6.2 添加数据库迁移工具
- [ ] 集成 Flyway 或 Liquibase
  - 添加依赖
  - 创建初始化脚本
  - 管理数据库版本

---

## 🟢 低优先级改进

### 7. 文档完善

#### 7.1 完善 API 文档
- [ ] 添加详细的 Swagger 注解
  - `@Parameter` - 参数说明
  - `@ApiResponse` - 响应说明
  - `@Schema` - 模型说明
  - 文件位置：所有控制器和 DTO

```java
// 示例
@Operation(summary = "创建会议室", description = "创建一个新的视频会议室")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "创建成功"),
    @ApiResponse(responseCode = "400", description = "参数错误"),
    @ApiResponse(responseCode = "401", description = "未授权")
})
@PostMapping("/rooms")
public ResponseEntity<ApiResponse<RoomDto>> createRoom(
    @Parameter(description = "会议室创建请求") @Valid @RequestBody CreateRoomRequest request,
    Authentication authentication
) { }
```

#### 7.2 添加代码注释
- [ ] 为复杂的业务逻辑添加注释
  - 解释为什么这样做，而不是做了什么
  - 文件位置：Service 类中的复杂方法

- [ ] 为所有公共方法添加 JavaDoc 注释
  - 说明方法的功能、参数、返回值、可能抛出的异常
  - 文件位置：所有 Service、Controller、Repository 类

- [ ] 为关键业务逻辑添加行内注释
  - 解释复杂的算法或业务规则
  - 说明为什么采用某种实现方式
  - 标注潜在的性能瓶颈或需要优化的地方
  - 文件位置：Service 类中的复杂方法

- [ ] 为配置类添加说明注释
  - 解释配置的目的和影响
  - 说明配置参数的含义
  - 文件位置：`backend/src/main/java/com/videoplat/config/`

```java
// 示例：JavaDoc 注释
/**
 * 创建新的视频会议室
 *
 * @param request 会议室创建请求，包含会议室名称、密码等信息
 * @param creatorId 创建者的用户ID
 * @return 创建成功的会议室信息
 * @throws BusinessException 当会议室名称重复或参数无效时抛出
 */
@Transactional
public RoomDto createRoom(CreateRoomRequest request, Long creatorId) {
    // 验证会议室名称是否已存在
    // 注意：这里使用数据库唯一约束来保证并发安全
    if (roomRepository.existsByRoomName(request.getRoomName())) {
        throw new BusinessException("会议室名称已存在");
    }

    // 生成唯一的会议室ID
    // 使用 UUID 确保分布式环境下的唯一性
    String roomId = UUID.randomUUID().toString();

    // ... 其他业务逻辑
}
```

```java
// 示例：配置类注释
/**
 * WebSocket 配置类
 *
 * 配置 WebSocket 端点和 STOMP 消息代理，用于实现会议室的实时信令通信。
 *
 * 端点说明：
 * - /ws/signaling: WebSocket 连接端点
 * - /app: 客户端发送消息的目标前缀
 * - /topic: 服务器广播消息的目标前缀
 *
 * @author VideoPlat Team
 * @since 1.0.0
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    // ...
}
```

### 8. 测试

#### 8.1 添加单元测试
- [ ] Service 层单元测试
  - 使用 Mockito 模拟依赖
  - 测试业务逻辑
  - 目标覆盖率：80%+

- [ ] Repository 层测试
  - 使用 `@DataJpaTest`
  - 测试自定义查询

#### 8.2 添加集成测试
- [ ] API 集成测试
  - 使用 `@SpringBootTest`
  - 测试完整的请求-响应流程
  - 使用 TestContainers 启动测试数据库

#### 8.3 添加性能测试
- [ ] 使用 JMeter 或 Gatling
  - 测试并发场景
  - 测试数据库查询性能
  - 测试 WebSocket 连接数

---

## 📊 改进效果预期

### 安全性
- ✅ JWT 配置更安全，防止密钥泄露
- ✅ 完善的权限控制，防止越权访问
- ✅ CORS 配置更严格，防止跨域攻击

### 性能
- ✅ 解决 N+1 查询，数据库查询效率提升 50%+
- ✅ 添加缓存，响应时间减少 70%+
- ✅ 添加索引，查询速度提升 3-5 倍

### 代码质量
- ✅ 异常处理更完善，错误信息更清晰
- ✅ 日志记录更规范，便于调试和审计
- ✅ 代码重复减少，可维护性提升

### 功能完善
- ✅ WebSocket 实时通信，用户体验更好
- ✅ 审计日志完整，便于追踪问题
- ✅ API 文档完善，便于前端对接

---

## 🔧 实施建议

### 阶段一：安全性和性能（1-2周）
1. JWT 配置优化
2. 解决 N+1 查询问题
3. 添加 Redis 缓存
4. 改进异常处理

### 阶段二：代码质量（1周）
1. 统一日志记录
2. 消除代码重复
3. 添加输入验证
4. 完善 API 文档

### 阶段三：功能完善（1-2周）
1. 实现 WebSocket 信令
2. 添加审计日志
3. 添加速率限制
4. 优化事务管理

### 阶段四：测试和优化（1周）
1. 添加单元测试
2. 添加集成测试
3. 性能测试和优化
4. 文档完善

---

## 📝 注意事项

1. **向后兼容**：改进时注意保持 API 向后兼容
2. **渐进式改进**：不要一次性修改太多，分批次进行
3. **测试覆盖**：每次改进后都要进行充分测试
4. **代码审查**：重要改进需要进行代码审查
5. **文档更新**：改进后及时更新 CLAUDE.md 和 API 文档

---

## 🔗 相关文件

### 核心文件位置
- **配置类**：`backend/src/main/java/com/videoplat/config/`
- **服务类**：`backend/src/main/java/com/videoplat/service/`
- **控制器**：`backend/src/main/java/com/videoplat/controller/`
- **实体类**：`backend/src/main/java/com/videoplat/model/`
- **DTO**：`backend/src/main/java/com/videoplat/dto/`
- **异常处理**：`backend/src/main/java/com/videoplat/exception/`
- **安全配置**：`backend/src/main/java/com/videoplat/security/`

### 配置文件
- **应用配置**：`backend/src/main/resources/application.yml`
- **依赖管理**：`backend/pom.xml`

---

**最后更新**：2026-02-08
**审查人**：Claude Code
**状态**：待实施
