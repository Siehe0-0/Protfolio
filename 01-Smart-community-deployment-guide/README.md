# 智慧社区管理系统本地部署与故障排除指南
## 文档简介
- **目标**：帮助团队成员在本地环境中快速、正确地部署并运行智慧社区管理系统。
- **目标读者**：需要部署或维护本项目的开发、测试及技术支持人员。
- **环境说明**：本文档基于 Windows 11 / JDK 11 / MySQL 8.0 环境编写，其他环境可参考。
- **前置知识**：了解基本的命令行操作、Maven项目结构和Spring Boot框架。

## 文档信息
- **版本**：v1.0
- **最后更新**：2025年12月25日
- **修订历史**：
  - v1.0 (2025-12-25)：初版创建

## 一、部署前准备
### 1.1 获取项目资源
- 代码仓库地址 
- 数据库初始化脚本位置

### 1.2 环境检查清单
- **JDK**：要求版本11。
- **Maven**:要求版本3.9.11。
- **MySQL**:要求版本8.0。
- **Redis**:要求版本8.0。
- **Erlang/OTP**（RabbitMQ依赖）:要求版本20.3.8.22。
- **Rabbitmq**:要求版本3.7.4。
- **Nginx**:可选，用于，要求版本1.16.1。
- **Git**:可选，用于拉取代码 。

### 1.3 环境变量配置（关键步骤）
#### Java 环境变量（JAVA_HOME）
1. 确认JDK安装路径，如：`C:\Program Files\Java\jdk-11`
2. 设置系统环境变量：
   - **JAVA_HOME**：`C:\Program Files\Java\jdk-11`
   - **Path**：添加 `%JAVA_HOME%\bin`
3. 检查命令`echo %JAVA_HOME%`和`java -version`

#### Maven 环境变量（MAVEN_HOME）
1. 确认Maven安装路径，如：`C:\Program Files\Java\maven-3.9.11`
2. 设置系统环境变量：
   - **MAVEN_HOME**：`C:\Program Files\Java\maven-3.9.11`
   - **Path**：添加 `%MAVEN_HOME%\bin`
3. 检查命令`mvn -v`

#### OTP 环境变量（ERLANG_HOME）
1. 确认JDK安装路径，如：`C:\Program Files\Java\erl`。
2. 设置系统环境变量：
   - **ERLANG_HOME**：`C:\Program Files\Java\erl9.3\erts-9.3`。
   - **Path**：添加 `%ERLANG_HOME%\bin`
3. 检查命令,`erl`进入Erlang交互式环境，输入`halt().` 退出

## 二、逐步部署流程 
### 2.1 数据库初始化 
1. 启动Mysql服务。
    > *打开服务管理器，查看所有MySQL服务*  
     services.msc  
    *启动mysql服务*  
     net start mysql80 
2. 使用在Navicat中创建连接，导入数据库（拖动文件夹即可）。
### 2.2 后端项目配置与启动  
1. 使用IDE导入Maven项目。  
2. 修改 `application.yml` 连接配置。
~~~
server:
  port: 10000
  servlet:
    context-path: /

spring:
  datasource: #数据库链接相关配置
    druid:
      master:
        url: jdbc:mysql://localhost:3306/mall_db?setUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8&useAffectedRows=true&useOldAliasMetadataBehavior=true
        username: root
        password: 123456
      slave:
        url: jdbc:mysql://localhost:3306/mall_log?setUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8&useAffectedRows=true&useOldAliasMetadataBehavior=true
        username: root
        password: 123456
  redis:
    host: localhost
    port: 6380
    timeout: 5000ms
  elasticsearch:
    rest:
      uris: localhost:9200
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: neuedu


mybatis-plus:
  mapper-locations: classpath:mapper/**/*.xml

customFile:
  savePath: D:\Development\Servers\nginx-1.22.1\html\storage
  ~~~
3. 运行主启动类 `WebApp`。

## 三、常见问题与排错
### 3.1 JDK版本冲突
- **问题现象**：启动报错`UnsupportedClassVersionError`。
- **原因分析**：JDK版本冲突。
- **解决方案** 
  1. 提供[JDK11官方下载连接](https://www.oracle.com/cn/java/technologies/javase/jdk11-archive-downloads.html)。 
  2. 检查IDE编译环境是否为JDK11.
  3. 检查系统环境变量中JDK路径是否为JDK11的路径，且JDK11的路径优先级应高于官方路径`C:\\Program Files\\Common Files\\Oracle\\Java\\javapath\\ ` 
### 3.2 数据库连接异常 
- **问题现象**：启动报错`Communications link failure`
- **原因分析**：MySQL 服务未启动、配置信息错误、或权限问题。
- **解决方案** 
  1. 确认mysql服务已启动 。
  2. 逐项核对 `application.yml` 中的 `url`, `username`, `password`。
  3. 提供修改 MySQL 用户权限的示例 SQL 语句。
### 3.3 Maven依赖下载失败/缺失
- **问题现象**：启动报错` Failed to collect dependencies `
- **原因分析**：网络问题导致依赖下载失败，或本地仓库损坏。
- **解决方案** 
  1. 检查网络，或配置国内镜像源（提供阿里云 Maven 镜像配置示例）。
  2. 执行 `mvn clean install -U` 强制更新依赖。
  3. 删除本地仓库中对应的依赖文件夹，重新下载。
### 3.4 端口号已占用 
- **问题现象**：启动报错`Web server failed to start. Port 10000 was already in use.`。
- **原因分析**：有进程在此端口号运行。
- **解决方案** 
  1. 使用`netstat -ano | findstr :端口号`命令查看并决定是否用`taskkill /PID 进程号 /F`命令结束正在运行的进程。
  2. 在配置文件`application.yml`修改端口号。
  3. 浏览器访问测试`http://localhost:端口号/swagger-ui.html`
### 3.5 前端请求失败
- **问题现象**：前端请求失败，报错`javax.xml.bind.DatatypeConverter`。
- **原因分析**：代码中使用用了Java EE 模块的库（如 JWT、XML 处理等）。
- **解决方案** 
  1. 提供pom.xml文件中需要补充的依赖代码。
    ~~~
        <!-- 添加 JAXB API 依赖 -->
		<dependency>
			<groupId>javax.xml.bind</groupId>
			<artifactId>jaxb-api</artifactId>
			<version>2.3.1</version>
		</dependency>

		<!-- 添加 JAXB 实现 -->
		<dependency>
			<groupId>com.sun.xml.bind</groupId>
			<artifactId>jaxb-core</artifactId>
			<version>2.3.0.1</version>
		</dependency>
		<dependency>
			<groupId>com.sun.xml.bind</groupId>
			<artifactId>jaxb-impl</artifactId>
			<version>2.3.1</version>
		</dependency>

		<!-- 添加 JAXB 需要的 activation API -->
		<dependency>
			<groupId>javax.activation</groupId>
			<artifactId>activation</artifactId>
			<version>1.1.1</version>
		</dependency>
    ~~~

## 四、部署成功验证
- 使用`npm install`命令配置依赖，在cmd终端运行`npm run dev`启动前端项目，点击 网址`http://localhost:5174`访问前端。
- 开启redis、rabbitmq、otp等服务，并运行后端项目，浏览器输入`http://127.0.0.1:端口号/swagger-ui.html`验证后端（应可看API文档）。
- 利用测试账号和密码，进行登录等关键功能验证。
- 成功登入。  

![效果截图](./images/loginhome.png)

## 五、问题反馈渠道
- 如在遵循本指南后仍遇到问题，请按以下格式整理信息，以便向开发团队反馈：
    1.  **环境信息**：操作系统、JDK版本、MySQL版本。
    2.  **问题描述**：清晰描述操作步骤、预期结果、实际结果。
    3.  **错误日志**：复制完整的错误日志或截图。
    4.  **已尝试的解决步骤**：说明你已根据本指南做了哪些尝试。
