# 若依前后端分离版二次开发
## 文档简介
- **版本**：若依3.9.2前后端分离版
- **面向对象**：零基础想快速跑通项目的编程学习者，本教程可借助ai，低代码开发。
- **环境配置**：JDK，IDE，MySQL，Navicat，Redis，Vscode，Node.js 。文章结尾提供环境部署教程。
- **相关技术**：SpringBoot，Java，Vue3。

## 1.若依前后端分离版本地导入
在此提供若依官网链接：[若依官网](https://ruoyi.vip/)  
进入官网，点击“导航栏——源码地址”可选不同版本的若依框架，本教程仅以前后端分离版为例。  
官网提供各版本若依框架使用指南。  
**本地导入的方式分为两种** 

![下载方式](./img/Ruoyi/load.png)
1. zip下载:下载解压后，软件内文件——打开文件夹
2. git克隆：打开IDE,具体操作见下图。[Git零基础教程](https://github.com/Siehe0-0/Protfolio/blob/master/02-Study%20Notes/git.md)  

![idea clone 1](./img/Ruoyi/clone1.png)
![idea clone 2](./img/Ruoyi/clone2.png)
## 2.若依项目运行
### 2.1 运行准备
#### 2.1.1 创建数据库
打开Navicat数据库管理工具，创建数据库"test"，可自命名。  

![crate database](./img/Ruoyi/database.png)

#### 2.1.2 连接数据库
IDE连接数据库：修改配置文件，使程序连接数据库。

![程序连接数据库](./img/Ruoyi/sqlconnect0.png)

⚠ 过去字符集utf8为utf8mb3别名，utf8mb4内容上完全兼容utf8mb3，因此遇到utf8可以改为utf8mb4。
> utf8mb3:每字符最多用3字节存储，不能存emoji表情和部分罕见汉字

> utf8mb4:每字符最多用4字节存储，可以存emoji表情和部分罕见汉字

#### 2.1.3 执行sql文件
- IDE专业版(IDE提供教育优惠，可先试用后申请)
> 专业版IDE可使用内置的database工具  

- IDE社区版
> 方法1（推荐）：使用navicat
>
>> 右键数据库，选择执行SQL文件，选中ruoyi项目中sql文件

![sql_navicat](./img/Ruoyi/sql_navicat.png)


> 方法2（备选）：使用终端命令行（在此仅提供一种）
> 
>> 右键选择sql文件所在文件夹，在终端打开，进入mysql会话，选择数据库，执行sql文件

![sql_terminal1](./img/Ruoyi/sql_terminal1.png)
![sql_terminal2](./img/Ruoyi/sql_terminal2.png)
 

### 2.2 前端运行
### 2.3 后端运行
## 3.认识若依项目
### 3.1认识前端
### 3.2认识后端
### 3.3认识若依内置功能
## 4.业务实现
### 4.1数据库设计
### 4.2代码生成功能的使用
#### 4.2.1单表业务实现
#### 4.2.2多表业务实现
### 4.3 
## 5.环境配置




mysql -u root -p

# 输入密码后，选择数据库

use ry-vue

# 粘贴建表SQL（可以分条执行）

source /path/to/your/create\_tables.sql;

