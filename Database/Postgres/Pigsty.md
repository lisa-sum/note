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

[APP的账号和密码](https://doc.pigsty.cc/#/APP):
https://doc.pigsty.cc/#/PGSQL-SVC?id=personal-user
PGSQL：PostgreSQL 集群可以

|用户名|密码|数据库|
|--|--|--|
|dbuser_dba| DBUser.DBA| /meta|
|dbuser_meta| DBUser.Meta| /meta|
|dbuser_view| DBUser.View| /meta|

或者 通过默认的 PGURL 访问：:
```
psql postgres://dbuser_dba:DBUser.DBA@10.10.10.10/meta     # database superuser 
psql postgres://dbuser_meta:DBUser.Meta@10.10.10.10/meta   # business administrator
psql postgres://dbuser_view:DBUser.View@pg-meta/meta       # default read-only user via domain name
```

grafana:
username：`admin` 
password: `pigsty`

Pgadmin4:
- PGADMIN_PORT=admin@pigsty.cc
- PGADMIN_USERNAME=admin@pigsty.cc
- PGADMIN_PASSWORD=pigsty
```
https://github.com/Vonng/pigsty/tree/master/app/pgadmin
```

## 主从复制
使用前请先在每个节点进行安装Pigsty,阅读和参考:
1. https://doc.pigsty.cc/#/PGSQL-CONF?id=replica
2. https://pigsty.cc/zh/docs/install/
3. https://doc.pigsty.cc/#/INSTALL?id=install

主节点必须是可以直接通过ssh访问的,如果需要密码, 则需要添加如下, 修改以下命令替换为你的物理机参数
```shell
cat ~/.ssh/id_rsa.pub | ssh root@192.168.2.102 'cat >> ~/.ssh/authorized_keys'
cat ~/.ssh/id_rsa.pub | ssh root@192.168.2.158 'cat >> ~/.ssh/authorized_keys'
```

编辑`pigsty.yml`,添加副本IP
```
    pg-test:
      hosts:
        10.10.10.11: { pg_seq: 1, pg_role: primary }   # primary instance, leader of cluster
        192.168.2.155: { pg_seq: 2, pg_role: replica }   # replica instance, follower of leader
        192.168.2.158: { pg_seq: 3, pg_role: replica, pg_offline_query: true } # replica with offline access
```

然后执行:
```shell
./node.yml -l pg-test
```
## 资料
1. https://doc.pigsty.cc/#/INSTALL?id=get-started
2. https://pigsty.cc/zh/docs/reference/install/
3. https://doc.pigsty.cc/#/FAQ