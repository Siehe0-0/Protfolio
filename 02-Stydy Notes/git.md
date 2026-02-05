# Git使用
## 一、第一次完整使用（从创建到推送）
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
      <td>进入项目文件夹，初始化本地仓库</td>
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
      <td>添加所有新增文件到暂存区</td>
      <td><code>git add .</code></td>
      <td><code>.</code>表示当前目录所有文件</td>
    </tr>
    <tr>
      <td>添加提交信息</td>
      <td><code>git commit -m "提交说明"</code></td>
      <td>引号内为提交说明</td>
    </tr>
    <tr>
      <td>查看当前分支</td>
      <td><code>git branch</code></td>
      <td>带<code>*</code>的是当前分支</td>
    </tr>
    <tr>
      <td>推送到远程仓库</td>
      <td><code>git push -u origin master</code></td>
      <td><code>master</code>为要推送的分支名，<br>
          <code>push</code>推送本地提交到远程，<br>
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
      <td>添加修改到暂存区并提交</td>
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
### 2.1远程仓库已有文件（如README）
#### 创建远程仓库时勾选了"Add a README"或".gitignore"

```
# 先拉取远程内容（因为远程不为空）
git pull origin main --allow-unrelated-histories

# 解决可能的冲突
# 如果提示有冲突，手动合并文件

# 然后再推送
git push -u origin main
```

### 2.2
    如果使用SSH（更安全，不用每次输密码）：
```
# 先拉取远程内容（因为远程不为空）
git pull origin main --allow-unrelated-histories

# 解决可能的冲突
# 如果提示有冲突，手动合并文件

# 然后再推送
git push -u origin main
```

### 2.3
