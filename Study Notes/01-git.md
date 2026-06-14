# Git使用
📣📣📣 账号注册等内容见文章结尾
## 一、第一次完整使用（从创建到推送）
![内容流转](./img/git/deliver.png)
<table>
  <thead>
    <tr>
      <th>步骤</th>
      <th>代码</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>创建远程仓库</td>
      <td><em>通过GitHub/Gitee网页创建</em></td>
      <td></td>
    </tr>
    <tr>
      <td>进入项目文件夹，打开终端，初始化本地仓库</td>
      <td><code>git init</code></td>
      <td>每个项目都有独立的本地仓库</td>
    </tr>
    <tr>
      <td>配置用户信息</td>
      <td><code>git config --global user.name "你的名字"</code><br>
          <code>git config --global user.email "你的邮箱"</code></td>
      <td>全局配置，所有项目生效</td>
    </tr>
    <tr>
      <td>关联远程仓库</td>
      <td><code>git remote add origin https://gitee.com/用户名/仓库名.git</code></td>
      <td><code>remote</code>为远程仓库操作，<br>
          <code>origin</code>为约定俗成的远程仓库别名，可以添加多个远程</td>
    </tr>
    <tr>
      <td>检查是否关联成功</td>
      <td><code>git remote -v</code></td>
      <td>显示所有远程仓库地址</td>
    </tr>
     <tr>
      <td>拉取远程内容（通用）</td>
      <td><code>git pull origin main --allow-unrelated-histories</code></td>
      <td><code>main</code>为远程仓库默认分支名（版本有差异，自行查看）<br>
          ⚠注：下文命令默认远程仓库默认分支名为<code>main</code>
      </td>
    </tr>
    <tr>
      <td>添加所有新增文件到暂存区</td>
      <td><code>git add .</code></td>
      <td><code>.</code>表示当前目录所有文件</td>
    </tr>
    <tr>
      <td>将修改提交至本地仓库</td>
      <td><code>git commit -m "提交说明"</code></td>
      <td>引号内为提交说明，git拒绝提交说明为空的修改，绕过说明（不推荐）<code>git commit --allow-empty-message</code></td>
    </tr>
    <tr>
      <td>查看当前分支</td>
      <td><code>git branch</code></td>
      <td>带<code>*</code>的是当前分支</td>
    </tr>
    <tr>
      <td>推送到远程仓库</td>
      <td><code>git push -u origin main</code></td>
      <td><code>main</code>为更改内容将要被推送到的远程仓库分支名<br>
          如果改为<code>master</code>,远程仓库将新建<code>master</code>分支<br>
          <code>push</code>将本地推送到远程，<br>
          第一次使用需要<code>-u</code>参数，意为设置默认上游分支</td>
    </tr>
    <tr>
      <td>推送成功验证</td>
      <td><code>git log --oneline</code><br>
          <code>git status</code></td>
      <td>查看提交历史和当前状态</td>
    </tr>
    <tr>
      <td>拉取更新</td>
      <td><code>git pull</code></td>
      <td>拉取远程更新到本地</td>
    </tr>
    <tr>
      <td>再次修改文件后</td>
      <td></td>
      <td>注意保存修改</td>
    </tr>
    <tr>
      <td>添加修改到暂存区并提交修改到本地仓库</td>
      <td><code>git add .</code><br>
          <code>git commit -m "更新说明"</code></td>
      <td>重复添加-提交流程</td>
    </tr>
    <tr>
      <td>推送到远程</td>
      <td><code>git push</code></td>
      <td>第二次及以后可以省略<code>-u origin master</code></td>
    </tr>
    <tr>
      <td>推送成功验证</td>
      <td><code>git log --oneline</code><br>
          <code>git status</code></td>
      <td>确认推送成功</td>
    </tr>
  </tbody>
</table>


## 二、常见问题及解决
### 2.1 远程仓库已有文件（如README）
  创建远程仓库时勾选了"Add a README"或".gitignore"

```

# 先拉取远程内容（因为远程不为空）
git pull origin main --allow-unrelated-histories

# 解决可能的冲突
# 如果提示有冲突，手动合并文件

# 然后再推送
git push -u origin main

```

### 2.2 DNS解析失败
- 报错：lookup github-cloud.s3.amazonaws.com: no such host 
- 说明：国内 DNS 污染或网络问题，无法解析GitHub LFS 存储图片的 AWS S3 服务器地址
> **有以下四个方案解决：**
>
> - 1.修改hosts文件（低风险）
> - 2.配置git代理（中低风险）
> - 3.更换系统DNS（安全）
> - 4.使用SSH协议（安全）

```

#在此仅介绍修改hosts文件
1.获取可信ip
-在powershell执行nslookup命令查询ip地址
-其中，8.8.8.8 是 Google 的公共 DNS 服务器，全球可用，不经过任何运营商劫持。
-部分学校校园网较严格，请更换为热点


2.修改hosts文件
-管理员身份运行记事本打开hosts文件
-将IP地址添加到文件结尾
-ipconfig /flushdns刷新DNS地址
-ping github-cloud.s3.amazonaws.com验证是否生效

3.重新尝试推送
git push

```

### 2.3 删除错误上传的文件夹
  例如，我们要删除的文件夹名为B，上级文件夹为A

```

#进入文件夹A，打开终端

#删除操作
git rm -r "B"

#提交修改信息
git commit -m "删除错误文件夹"

#推送到远程
git push

```

### 2.4 上传图片大导致的仓库臃肿
  Git官方提供Git LFS工具
  - Git存储和LFS存储分开管理
  
```

#工具安装
1.Windows：git for windows自带
2.macOS:brew install git-lfs
3.Linux:sudo apt-get install git-lfs

#工具初始化
git lfs install

#指定要追踪的图片类型
git lfs track "*.png"
git lfs track "*.jpg"

#提交.gitattributes配置文件的修改，LGS规则通过该文件共享，安装LFS客户端即可获取真实文件
git add .gitattributes
git commit -m "使用GitLFS管理图片"

#配置之前已上传过图片的解决方法：重写历史并迁移图片
git lfs migrate import --include="*.png, *.jpg" --everything

#修改历史后需要强制推送
git push force all

```

### 2.5 分支管理
#### 2.5.1 拉取指定分支
  假设当前分支为"BBB"， 欲拉取分支 "AAA"

```
#不切换分支直接拉取指定分支
git pull origin AAA

```

#### 2.5.2 切换分支
  将 "BBB" 分支名改为 "AAA" 

```

#注意保存并关闭原分支文件夹
git checkout AAA

```

#### 2.5.3 分支改名
  将 "BBB" 分支名改为 "AAA" 

```
#当前分支改名
git branch -m AAA

#直接修改
git branch -m BBB AAA

⚠如果已经推送过远程，修改分支名后还需要同步远程分支,如下：

#推送新分支
git push origin -u AAA 

#删除远程旧分支
git push origin --delete BBB 

```

#### 2.5.4 分支合并
  当前分支为分支AAA，将分支 "BBB" 中内容同步更新到分支 "AAA" 中

```
#查看当前分支 (带 * 的是当前分支)
git branch

#将 BBB 的内容合并到 AAA
git merge BBB

#如果有冲突，修改冲突文件

#整体提交或提交冲突文件
git add .
git commit -m "merge BBB into AAA"

#推送到远程
git push

```





