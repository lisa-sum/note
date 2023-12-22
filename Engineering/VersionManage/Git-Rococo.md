
# Git

#Git #命令

## 常用操作
工程化操作
[文章](https://www.cnblogs.com/sexintercourse/p/15491447.html)
```shell
git config --global core.autocrlf false
```

**拉取远程仓库文件**

```git
git clone `<git地址>`
```

**添加到缓存区**

```git
git add `<filename>` 单个文件
git add . 监控工作区的状态树，使用它会把工作时的所有变化提交到暂存区，包括文件内容修改(modified)以及新文件(new)，但不包括被删除的文件
git add -u | --update 仅监听已经被添加的文件,将被修改的文件提交到暂存区.不会提交新文件
git add -A | --all：是上面两个功能的合集（git add --all的缩写）
```

**填写注释**

```git
git commit -m "提交内容简要描述"
```

**提交到远程仓库**

```git
git push
```

提交所有`tag`到远程
```shell
git push -u <分支> --tags
```

**忽略提交内容**

1. 创建 `.gitignore`

   ```shell
   touch .gitignore
   ```

2. 在`.gitignore` 文件添加需要忽略的内容

>` 例: node_modules
```
//.gitignore 
node_modules
```

## 本地创建仓库并且提交到远程仓库

1. 创建仓库

   ```git
   git init
   ```

2. 链接到仓库

   ```git
   git remote add origin `<你的仓库地址>`
   ```

3. 提交文件
   ```git
   git add `<file>`
   ```

4. 提交注释
   ```git
   git commit -m `<message>`
   ```

5. 推送
   ```git
   git push
   ```

## 修改和提交

git status 查看状态

git diff   查看变更内容

git mv `<old>` `<new>` 文件改名

git rm `<file>`      删除文件

git rm --cached `<file>`  停止跟踪文件但不删除

git commit --amend 重新填写commit message内容

git restore --staged 撤销已经commit的文件

git  reset --soft  HEAD~<commit,1表示最后一次> 软撤销,不撤销添加的文件

git reset --hard HEAD~1 恢复到了上一次的commit状态。

git push --follow-tags <本地分支> <远程分支>  将本次提交的内容的`注释`创建为`tag`分支推送至远程

## 查看提交历史
git log             查看提交历史
git log --pretty=oneline  列表方式查看历史
git log -p `<file>`   查看指定文件的提交历史
git blame `<file>`    以列表方式查看指定文件的提交历史
git refllog 查看所有的`git commit`信息, 包括已经删除的

## 撤销

git remote remove `<tag>`        撤销链接远程仓库

git remote remove main

git reset `<file>` 撤销已经添加的`<file>`文件

git reset 撤销已经添加的全部文件

git revert `<commit>`   撤消指定的提交

## 分支与标签

git push --force `<本地分支>` `<远程分支>` 本地分支覆盖远程分支
git pull --force `<本地分支>` `<远程分支>` 远程分支覆盖本地分支
git branch                        显示所有本地分支
git checkout `<branch/tag>`          切换到指定分支或标签
git branch `<new-branch>`            创建新分支
git branch -d `<branch>`            删除本地分支
git tag                          列出所有本地标签
git tag `<tagname>`                 基于最新提交创建标签
git tag -d `<tagname>`              删除标签

## 合并与

git merge `<branch>`     合并指定分支到当前分支

## 远程操作

git remote -v        查看远程版本库信息
git remote show `<remote>`   查看指定远程版本库信息
git remote add `<remote>` `<url>`  添加远程版本库
git fetch `<remote>`      从远程库获取代码
git pull`<remote>``<branch>`#    下载代码及快速合并
git push `<remote>``<branch>`    上传代码及快速合并
git push `<remote>``<branch/tag-name>` 删除远程分支或标签
git push--tags       上传所有标签
git log                            提交信息
