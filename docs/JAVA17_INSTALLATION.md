# Java 17 安装指南

## 当前状态
- ❌ 系统当前使用 Java 8
- ✅ 项目需要 Java 17+

## 快速安装步骤

### 方式 1：使用 Adoptium（推荐）

1. **下载 Java 17**
   - 访问：https://adoptium.net/temurin/releases/
   - 选择：
     - Version: 17 - LTS
     - Operating System: Windows
     - Architecture: x64
     - Package Type: JDK
   - 点击下载 `.msi` 安装包

2. **安装**
   - 双击下载的 `.msi` 文件
   - 勾选 "Set JAVA_HOME variable"
   - 勾选 "Add to PATH"
   - 点击 "Install"

3. **验证安装**
   ```bash
   # 重新打开命令行窗口
   java -version
   # 应该显示：openjdk version "17.x.x"
   ```

### 方式 2：使用 Oracle JDK

1. **下载**
   - 访问：https://www.oracle.com/java/technologies/downloads/#java17
   - 选择 Windows x64 Installer
   - 下载 `jdk-17_windows-x64_bin.exe`

2. **安装**
   - 运行安装程序
   - 按照向导完成安装

3. **配置环境变量**
   - 右键"此电脑" → "属性" → "高级系统设置"
   - 点击"环境变量"
   - 系统变量中新建：
     - 变量名：`JAVA_HOME`
     - 变量值：`C:\Program Files\Java\jdk-17`
   - 编辑 `Path` 变量，添加：
     - `%JAVA_HOME%\bin`
   - 确保 Java 17 的路径在 Java 8 之前

4. **验证**
   ```bash
   java -version
   ```

### 方式 3：使用 Chocolatey（如果已安装）

```bash
choco install openjdk17
```

## 安装后操作

### 1. 验证 Java 版本
```bash
java -version
javac -version
```

应该显示类似：
```
openjdk version "17.0.x" 2024-xx-xx
OpenJDK Runtime Environment Temurin-17.0.x (build 17.0.x+x)
OpenJDK 64-Bit Server VM Temurin-17.0.x (build 17.0.x+x, mixed mode, sharing)
```

### 2. 验证 JAVA_HOME
```bash
echo %JAVA_HOME%
```

应该显示 Java 17 的安装路径。

### 3. 编译后端项目
```bash
cd backend
mvn clean compile
```

或者如果没有 Maven：
```bash
cd backend
# 下载 Maven Wrapper
curl -o mvnw https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw
curl -o mvnw.cmd https://raw.githubusercontent.com/takari/maven-wrapper/master/mvnw.cmd
# 使用 Maven Wrapper 编译
./mvnw clean compile
```

## 常见问题

### Q1: 安装后还是显示 Java 8？
**A**: 需要重新打开命令行窗口，或者重启电脑。

### Q2: 如何同时保留 Java 8 和 Java 17？
**A**: 可以使用 jEnv 或手动切换 JAVA_HOME：
```bash
# 临时切换到 Java 17
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
```

### Q3: Maven 找不到？
**A**:
1. 下载 Maven：https://maven.apache.org/download.cgi
2. 解压到 `C:\Program Files\Maven`
3. 添加到 PATH：`C:\Program Files\Maven\bin`

或者使用项目中的 Maven Wrapper（推荐）。

## 下一步

安装完成后，运行以下命令测试：

```bash
# 1. 验证 Java
java -version

# 2. 编译后端
cd backend
mvn clean compile

# 3. 运行后端
mvn spring-boot:run
```

如果一切正常，后端将在 http://localhost:8080 启动。

## 快速链接

- Adoptium JDK 17: https://adoptium.net/temurin/releases/?version=17
- Oracle JDK 17: https://www.oracle.com/java/technologies/downloads/#java17
- Maven 下载: https://maven.apache.org/download.cgi
