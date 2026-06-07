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
- zip下载:下载解压后，软件内文件——打开文件夹
- git克隆：打开IDE,具体操作见下图。[git零基础教程](https://github.com/Siehe0-0/Protfolio/blob/master/02-Study%20Notes/git.md)  

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

#### 2.1.3 执行sql文件
- IDE专业版(IDE提供教育优惠，可先试用后申请)
> 专业版IDE可使用内置的database工具  

![idea-mysql1](./img/Ruoyi/sqlconnect1.png)

- IDE社区版

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

