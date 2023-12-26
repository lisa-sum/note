## 安装
```shell
bash -c "$(curl -fsSL https://get.pigsty.cc/latest)" 
cd ~/pigsty # get pigsty source and entering dir 
./bootstrap # download bootstrap pkgs & ansible [optional] 
./configure # pre-check and config templating [optional] 
./install.yml # install pigsty according to pigsty.yml
```

在 node/infra/pgsql 软件包安装过程中，可能会发生轻微的 rpm 冲突。
解决此问题的最简单方法是在不使用脱机包的情况下进行安装，脱机包将直接从上游存储库下载。
如果只有少数有问题的 RPM/DEB 包，您可以使用一个技巧来快速修复 yum/apt 存储库：

```
rm -rf /www/pigsty/repo_complete    # delete the repo_complete flag file to mark this repo incomplete
rm -rf SomeBrokenPackages           # delete problematic RPM/DEB packages
./infra.yml -t repo_upstream        # write upstream repos. you can also use /etc/yum.repos.d/backup/*
./infra.yml -t repo_pkg             # download rpms according to your current OS
```

然后重新安装:
```shell
./install.yml # install pigsty according to pigsty.yml
```
## 资料
1. https://doc.pigsty.cc/#/INSTALL?id=get-started
2. https://pigsty.cc/zh/docs/reference/install/
3. https://doc.pigsty.cc/#/FAQ