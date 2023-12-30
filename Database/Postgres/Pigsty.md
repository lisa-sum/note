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

### 安装

分两种情况:
1. 离线安装包
2. 在线安装

### 离线包
下载
```shell
VERSION=v2.5.1
cd /tmp && wget https://get.pigsty.cc/${VERSION}/pigsty-pkg-${VERSION}.ubuntu22.x86_64.tgz
```

安装`ansible` 可用，并尽最大努力使用离线软件包搭建本地软件源
```shell
./boostrap -p <离线包路径>
```
### 在线安装
Bootstrap 的详细逻辑如下：

1. 检查安装的前提条件是否满足

2. 检查本地离线安装包（`/tmp/pkg.tgz`）是否存在？
- 是 -> 解压到 `/www/pigsty` 并配置本地FS软件源启用它。
- 否 -> 进一步决定是否从互联网下载离线软件包？
    - 是 -> 从 GitHub 或 CDN 下载离线软件包并解压
    - 否 -> 是否添加操作系统基础的上游源地址以供从互联网下载 ?
        - 是 -> 根据地区与操作系统版本写入对应的上游源：`/etc/yum.repos.d/` 或 `/etc/apt/source.list.d`
        - 否 -> 用户自己搞定，或者当前系统的默认配置就带有 Ansible
    - 现在，我们有了一个可用的本地软件源，可用来安装 Pigsty 所需的软件包，特别是 Ansible。
    - 优先级顺序: 本地的 `pkg.tgz` > 下载的 `pkg.tgz` > 原始上游 > 默认配置

3. 从上一步配置的软件源中，安装一些基本的重要软件，不同版本的软件略有不同：

- el7: `ansible createrepo_c unzip wget yum-utils sshpass` EL7： `ansible createrepo_c unzip wget yum-utils sshpass`
- el8: `ansible python3.11-jmespath createrepo_c unzip wget dnf-utils sshpass modulemd-tools` EL8： `ansible python3.11-jmespath createrepo_c unzip wget dnf-utils sshpass modulemd-tools`
- el9: `ansible python3.11-jmespath createrepo_c unzip wget dnf-utils sshpass modulemd-tools` EL9： `ansible python3.11-jmespath createrepo_c unzip wget dnf-utils sshpass modulemd-tools`
- ubuntu/debian: `ansible python3-jmespath dpkg-dev unzip wget sshpass acl` Ubuntu/Debian的： `ansible python3-jmespath dpkg-dev unzip wget sshpass acl`

4. 检查 `ansible` 是否成功安装。

```shell
./boostrap -y
```
该操作会将离线包默认是/tmp/pkg.tgz，通常不需修改


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

## [监控外部PG](https://pigsty.cc/doc/#/zh/PARAM?id=pg_cluster)
```
pg_exporters: # list all remote instances here, alloc a unique unused local port as k 
	20001: { pg_cluster: pg-foo, pg_seq: 1, pg_host: 10.10.10.10 } 
	20004: { pg_cluster: pg-foo, pg_seq: 2, pg_host: 10.10.10.11 } 
	20002: { pg_cluster: pg-bar, pg_seq: 1, pg_host: 10.10.10.12 } 
	20003: { pg_cluster: pg-bar, pg_seq: 1, pg_host: 10.10.10.13 }
```

## 删除

```shell
rm -rf /www/pigsty # www的包
rm -rf /etc/apt/sources.list.d/pigsty.list #源
rm -rf /tmp/pgbackrest
rm -rf /tmp/pigsty-v2.5.1.tgz # 软件包
rm -rf ~/pigsty # 源码包
rm -rf /var/lib/postgresql/
systemctl stop postgresql
rm -rf /etc/init.d/postgresql
rm -rf /run/systemd/generator.late/postgresql.service
```
## 资料
1. https://doc.pigsty.cc/#/INSTALL?id=get-started
2. https://pigsty.cc/zh/docs/reference/install/
3. https://doc.pigsty.cc/#/FAQ