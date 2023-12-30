# 集群高可用读写分, 同步主备

## 说明
本文是根据[Pigsty](https://pigsty.cc/)开源库进行的数据库配置

## 先决条件
1. 系统环境要求和缺陷
参考 https://pigsty.cc/doc/#/zh/INSTALL?id=%e8%a6%81%e6%b1%82

| 代码	 | OS发行版	                             | 局限性                                          |
|-----|------------------------------------|----------------------------------------------|
| EL7 | 	RHEL7 / CentOS7	                  | PG16, supabase, pgml, pg_graphql, pg_net 不可用 |
| EL8 | 	RHEL8 / Rocky8 / Alma8 / Anolis8	 | EL功能基准                                       |
| EL9 | 	RHEL9 / Rocky9 / Alma9	           | pgxnclient缺失，perf 依赖冲突                       |
| D11 | 	Debian 11 (bullseye)	             | supabase,pgml, RDKit 不可用                     |
| D12 | 	Debian 12 (bookworm)	             | supabase, pgml 不可用                           |
| U20 | 	Ubuntu 20.04 (focal)	             | supabase, PostGIS3, RDKit, pgml 不可用          |
| U22 | 	Ubuntu 22.04 (jammy)	             | DEB功能基准 (supabase不可用)                        |

2. 机器配置
机器配置的要求最小是2G2C配置, 本文使用以下配置安装:

| OS发行版        | IP            | CPU | Memory |
|--------------|---------------|-----|--------|
| Ubuntu 22.04 | 192.168.2.152 | 16C | 32G    |
| Ubuntu 22.04 | 192.168.2.101 | 16C | 32G    |
| Ubuntu 22.04 | 192.168.2.102 | 16C | 32G    |

## 下载

下载源码包
```shell
bash -c "$(curl -fsSL https://get.pigsty.cc/latest)" 
```

> 在 `node/infra/pgsql` 软件包安装过程中，可能会发生轻微的 rpm 冲突。
> 解决此问题的最简单方法是在不使用脱机包的情况下进行安装，脱机包将直接从上游存储库下载。
> 如果只有少数有问题的 RPM/DEB 包，您可以使用一个技巧来快速修复 yum/apt 存储库：

```shell
rm -rf /www/pigsty/repo_complete    # delete the repo_complete flag file to mark this repo incomplete
rm -rf SomeBrokenPackages           # delete problematic RPM/DEB packages
./infra.yml -t repo_upstream        # write upstream repos. you can also use /etc/yum.repos.d/backup/*
./infra.yml -t repo_pkg             # download rpms according to your current OS
```

然后重新安装:
```shell
./install.yml
```

## 准备源码包
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

## 配置
### 单台实例

### 高可用

主节点必须是可以直接通过ssh访问从节点的,如果需要密码, 则需要添加如下, 修改以下命令替换为你的物理机参数
示例:

```shell
export SSH_FILE_PATH=~/.ssh/id_rsa.pub
export HOST_MASTER="192.168.2.152"
export HOST_NODE1="192.168.2.101"
export HOST_NODE2="192.168.2.102"
```

```shell
cat $SSH_FILE_PATH | ssh root@$HOST_NODE1 'cat >> ~/.ssh/authorized_keys'
cat $SSH_FILE_PATH | ssh root@$HOST_NODE2 'cat >> ~/.ssh/authorized_keys'
```

配置信息:
1. 部署grafana,prometheus,alertmanager,blackbox,loki基础设施模块在三台机器中
2. 3个etcd节点组成的etcd集群
3. 3个Postgres节点组成的Postgres高可用集群, 使用同步主备,即在主节点写的同时同步写到从节点数据库中,
4. 3主 x 3从 组成的redis原生高可用集群
5. nginx_port的http端口为5011,https为5443

集群信息,在182行开始编辑这些账密, 这是默认值:
pg-master:
账号: lisa
密码: msdnmm

pg-replication
账号: lisa
密码: msdnmm

redis:
账号: 
密码: 263393

grafana:
账号: admin
密码: msdnmm

pg_monitor:
账号: dbuser_monitor
密码: msdnmm

haproxy:
账号: admin
密码: msdnmm

> 这个模板必须存放在 ~/pigsty/files/pigsty/ 中, 默认就是从这里读取

cat > ~/pigsty/files/pigsty/pg-config.yaml <<EOF
---
all:
  children:

    # infra cluster for proxy, monitor, alert, etc..
    infra:
      hosts:
        10.10.10.10: { infra_seq: 1 }
        $HOST_NODE1: { infra_seq: 2 }
        $HOST_NODE2: { infra_seq: 3 }

    # etcd cluster for ha postgres
    # https://pigsty.cc/doc/#/zh/ETCD
    etcd:
      hosts:
        10.10.10.10: { etcd_seq: 1 } # etcd_seq （etcd实例号）是必须指定的身份参数
        NODE: { etcd_seq: 2 } # 实例号是正整数，一般从 0 或 1 开始依次分配
        $HOST_NODE2: { etcd_seq: 3 } # 实例号应当终生不可变，一旦分配就不再回收使用。
      vars: # 集群层面的参数
        etcd_cluster: etcd    # 默认情况下，etcd集群名就叫 etcd， 除非您想要部署多套 etcd 集群，否则不要改这个名字
        etcd_safeguard: false # 是否打开 etcd 的防误删安全保险？ 在生产环境初始化完成后，可以考虑打开这个选项，避免误删。
        etcd_clean: true      # 在初始化过程中，是否强制移除现有的 etcd 实例？测试的时候可以打开，这样剧本就是真正幂等的。

    # minio cluster, optional backup repo for pgbackrest
    #minio: { hosts: { 10.10.10.10: { minio_seq: 1 } }, vars: { minio_cluster: minio } }

    # postgres cluster 'pg-meta' with single primary instance
    pg-meta:
      hosts:
        10.10.10.10: { pg_seq: 1, pg_role: primary }
        $HOST_NODE1: { pg_seq: 2, pg_role: replica }
        $HOST_NODE2: { pg_seq: 3, pg_role: replica }
      vars:
        pg_cluster: pg-meta
        pg_conf: crit.yml   # <--- 使用 crit 模板 同步备库
        pg_databases: [ { name: meta ,baseline: cmdb.sql ,comment: pigsty meta database ,schemas: [ pigsty ] ,extensions: [{name: postgis, schema: public}] } ]
        pg_users:
          - { name: lisa ,password: 263393   ,pgbouncer: true ,roles: [ dbrole_admin ]    ,comment: pigsty admin user }
          - { name: dbuser_meta ,password: DBUser.Meta   ,pgbouncer: true ,roles: [ dbrole_admin ]    ,comment: pigsty admin user }
          - { name: dbuser_view ,password: DBUser.Viewer ,pgbouncer: true ,roles: [ dbrole_readonly ] ,comment: read-only viewer for meta database }
        pg_libs: 'pg_stat_statements, auto_explain' # add extra extensions to shared_preload_libraries
        node_crontab: [ '00 01 * * * postgres /pg/bin/pg-backup full' ] # make a full backup every 1am

    #----------------------------------#
    # redis ms, sentinel, native cluster
    #----------------------------------#
    redis-test: # redis 原生集群： 3主 x 3从
      hosts:
        $HOST_NODE1: { redis_node: 1 ,redis_instances: { 6380: { } ,6381: { } ,6382: { } } }
        $HOST_NODE2: { redis_node: 2 ,redis_instances: { 6380: { } ,6381: { } ,6382: { } } }
      vars: { redis_cluster: redis-native-cluster ,redis_password: '263393' ,redis_mode: cluster, redis_max_memory: 32MB }

  vars:                               # global parameters
    version: v2.5.1                   # pigsty version string
    admin_ip: 10.10.10.10             # 管理节点的 IP 地址，该节点只有一个值, 为控制节点的IP. 默认为占位符 IP 地址：10.10.10.10
    region: default                   # upstream mirror region: default,china,europe

    infra_portal:                     # domain names and upstream servers
      # 参考: https://doc.pigsty.cc/#/zh/PARAM?id=nginx
      # 每个记录包含三个子部分：name 作为键，代表组件名称，外部访问域名和内部TCP端口。 值包含 domain 和 endpoint，以及其他可选字段：
      # 默认记录的 name 定义是固定的，其他模块会引用它，所以不要修改默认条目名称。
      # domain 是用于外部访问此上游服务器的域名。域名将被添加到Nginx SSL证书的 SAN 字段中。
      # endpoint 是一个可以内部访问的TCP端口。如果包含 ${admin_ip} ，则将在运行时被实际的 admin_ip 替换。
      # 如果 websocket 设置为 true，http协议将自动为 Websocket 连接升级。
      # 如果给定了 scheme（http 或 https），它将被用作 proxy_pass URL的一部分。
      home         : { domain: h.rcc.com }
      grafana      : { domain: g.rcc.com , endpoint: "${admin_ip}:3000", websocket: true }
      prometheus   : { domain: p.rcc.com , endpoint: "${admin_ip}:9090" }
      alertmanager : { domain: a.rcc.com , endpoint: "${admin_ip}:9093" }
      blackbox     : { endpoint: "${admin_ip}:9115" }
      loki         : { endpoint: "${admin_ip}:3100" }
      #minio        : { domain: sss.pigsty  ,endpoint: "${admin_ip}:9001" ,scheme: https ,websocket: true }

    #-----------------------------------------------------------------
    # NGINX
    #-----------------------------------------------------------------
    nginx_enabled: true               # 是否在当前的 Infra 节点上启用 Nginx？默认值为： true。
    nginx_exporter_enabled: true      # 在此基础设施节点上启用 nginx_exporter ？默认值为： true 如果禁用此选项，还会一并禁用 /nginx 健康检查 stub，当您安装使用的 Nginx 版本不支持此功能是可以考虑关闭此开关
    # Nginx 的 SSL工作模式？有三种选择：disable , enable , enforce， 默认值为 enable，即启用 SSL，但不强制使用。
    # disable：只监听 nginx_port 指定的端口服务 HTTP 请求。
    # enable：同时会监听 nginx_ssl_port 指定的端口服务 HTTPS 请求。
    # enforce：所有链接都会被渲染为默认使用 https://
    nginx_sslmode: enable             # nginx ssl mode? disable,enable,enforce
    # Nginx服务器静态文件目录，默认为： /www
    # Nginx服务器的根目录，包含静态资源和软件仓库文件。最好不要随意修改此参数，修改时需要与 repo_home 参数保持一致。
    nginx_home: /www                  # nginx content dir, `/www` by default
    # Nginx 默认监听的端口（提供HTTP服务），默认为 80 端口，最好不要修改这个参数。
    # 当您的服务器 80 端口被占用时，可以考虑修改此参数，但是需要同时修改[repo_endpoint](https://doc.pigsty.cc/#/zh/PARAM?id=repo_endpoint) ，
    # 以及 [node_repo_local_urls]() 所使用的端口并与这里保持一致
    nginx_port: 5011                    # nginx listen port, 80 by default
    nginx_ssl_port: 5443               # nginx ssl listen port, 443 by default
    nginx_navbar: # Nginx 首页上的导航栏内容，默认值
      #  每一条记录都会被渲染为一个导航链接，链接到 Pigsty 首页的 App 下拉菜单，所有的 App 都是可选的，默认挂载在 Pigsty 默认服务器下的 http://pigsty/ 。
      # url 参数指定了 App 的 URL PATH，但是如果 URL 中包含 ${grafana} 字符串，它会被自动替换为 infra_portal 中定义的 Grafana 域名。
      # 所以您可以将一些使用 Grafana 的数据应用挂载到 Pigsty 的首页导航栏中。
      # TODO
      - { name: CA Cert ,url: '/ca.crt'   ,desc: 'pigsty self-signed ca.crt' }
      - { name: Package ,url: '/pigsty'   ,desc: 'local yum repo packages' }
      - { name: PG Logs ,url: '/logs'     ,desc: 'postgres raw csv logs' }
      - { name: Reports ,url: '/report'   ,desc: 'pgbadger summary report' }
      - { name: Explain ,url: '/pigsty/pev.html' ,desc: 'postgres explain visualizer' }
      - { name: Grafana ,url: '${grafana}.com' ,desc: 'Grafana Index' }
      - { name: Prometheus ,url: '${prometheus}.com' ,desc: 'Prometheus Index' }
      - { name: alertmanager ,url: '${alertmanager}.com' ,desc: 'alertmanager Index' }
      - { name: loki ,url: '${loki}.com' ,desc: 'loki Index' }

    #================================================================#
    #                         VARS: REDIS                            #
    #================================================================#
    redis_cluster: 'redis-native-cluster'             #<集群> # Redis数据库集群名称，必选身份参数
    redis_node: 1              # <节点> Redis节点上的实例定义
    redis_instances: {}        # <节点> Redis节点编号，正整数，集群内唯一，必选身份参数
    redis_fs_main: /data              # Redis主数据目录，默认为 `/data`
    redis_exporter_enabled: true      # Redis Exporter 是否启用？
    redis_exporter_port: 9121         # Redis Exporter监听端口
    redis_exporter_options: ''        # Redis Exporter命令参数
    redis_safeguard: false            # 禁止抹除现存的Redis
    redis_clean: true                 # 初始化Redis是否抹除现存实例
    redis_rmdata: true                # 移除Redis实例时是否一并移除数据？
    redis_mode: standalone            # Redis集群模式：sentinel，cluster，standalone
    redis_conf: redis.conf            # Redis配置文件模板，sentinel 除外
    redis_bind_address: '0.0.0.0'     # Redis监听地址，默认留空则会绑定主机IP
    redis_max_memory: 1GB             # Redis可用的最大内存
    # Redis内存逐出策略: 以下是可能的值
    # noeviction：内存达限时不保存新值：当使用主从复制时仅适用于主库
    # allkeys-lru：保持最近使用的键；删除最近最少使用的键（LRU）
    # allkeys-lfu：保持频繁使用的键；删除最少频繁使用的键（LFU）
    # volatile-lru：删除带有真实过期字段的最近最少使用的键
    # volatile-lfu：删除带有真实过期字段的最少频繁使用的键
    # allkeys-random：随机删除键以为新添加的数据腾出空间
    # volatile-random：随机删除带有过期字段的键
    # volatile-ttl：删除带有真实过期字段和最短剩余生存时间（TTL）值的键
    redis_mem_policy: allkeys-lru
    redis_password: '263393'                # Redis密码，默认留空则禁用密码
    redis_rdb_save: ['1200 1']        # Redis RDB 保存指令，字符串列表，空数组则禁用RDB
    redis_aof_enabled: false          # Redis AOF 是否启用？
    redis_rename_commands: {}         # Redis危险命令重命名列表
    redis_cluster_replicas: 1         # Redis原生集群中每个主库配几个从库？

    #-----------------------------------------------------------------
    # REPO
    #-----------------------------------------------------------------
    # 其他节点访问此仓库时使用的端点，默认值为：http://${admin_ip}:80。
    #
    #Pigsty 默认会在基础设施节点 80/443 端口启动 Nginx，对外提供本地软件源（静态文件）服务。
    #
    #如果您修改了 nginx_port 与 nginx_ssl_port，或者使用了不同于中控节点的基础设施节点，请相应调整此参数。
    #
    #如果您使用了域名，可以在 node_default_etc_hosts、node_etc_hosts、或者 dns_records 中添加解析。
    # access point to this repo by domain or ip:port
    repo_endpoint: http://${admin_ip}:5011
    # if disabled, original /etc/yum.repos.d/ will be kept
    repo_remove: true       # remove existing repo on admin node during repo bootstrap
    node_repo_remove: true  # remove existing node repo for node managed by pigsty

    # if you want to use minio as backup repo instead of local fs, uncomment minio related lines
    # don't forget to configure pgbackrest_repo and change credentials there!
    #pgbackrest_method: minio
    #minio_users:
    #  - { access_key: dba , secret_key: S3User.DBA, policy: consoleAdmin }
    #  - { access_key: pgbackrest , secret_key: S3User.Backup, policy: readwrite }

    # WARNING: CHANGE THESE PASSWORDS
    #grafana_admin_username: admin
    grafana_admin_password: msdnmm
    #pg_admin_username: dbuser_dba
    pg_admin_password: msdnmm
    #pg_monitor_username: dbuser_monitor
    pg_monitor_password: msdnmm
    #pg_replication_username: replicator
    pg_replication_password: msdnmm
    #patroni_username: postgres
    patroni_password: msdnmm
    #haproxy_admin_username: admin
    haproxy_admin_password: msdnmm

    # repo_xxx are used if you want to build your own yum repo from upstream directly
    repo_modules: node,pgsql,infra,minio,redis    # which repo modules are installed in repo_upstream

    repo_upstream:                    # where to download (ubuntu version)
      - { name: base        ,description: 'Ubuntu Basic'     ,module: node  ,releases: [20,22] ,baseurl: { default: 'https://mirrors.edge.kernel.org/${distro_name}/ ${distro_codename}           main universe multiverse restricted' ,china: 'https://mirrors.aliyun.com/${distro_name}/ ${distro_codename}           main restricted universe multiverse' }}
      - { name: updates     ,description: 'Ubuntu Updates'   ,module: node  ,releases: [20,22] ,baseurl: { default: 'https://mirrors.edge.kernel.org/${distro_name}/ ${distro_codename}-backports main restricted universe multiverse' ,china: 'https://mirrors.aliyun.com/${distro_name}/ ${distro_codename}-updates   main restricted universe multiverse' }}
      - { name: backports   ,description: 'Ubuntu Backports' ,module: node  ,releases: [20,22] ,baseurl: { default: 'https://mirrors.edge.kernel.org/${distro_name}/ ${distro_codename}-security  main restricted universe multiverse' ,china: 'https://mirrors.aliyun.com/${distro_name}/ ${distro_codename}-backports main restricted universe multiverse' }}
      - { name: security    ,description: 'Ubuntu Security'  ,module: node  ,releases: [20,22] ,baseurl: { default: 'https://mirrors.edge.kernel.org/${distro_name}/ ${distro_codename}-updates   main restricted universe multiverse' ,china: 'https://mirrors.aliyun.com/${distro_name}/ ${distro_codename}-security  main restricted universe multiverse' }}
      - { name: haproxy     ,description: 'HAProxy'          ,module: node  ,releases: [20,22] ,baseurl: { default: 'https://ppa.launchpadcontent.net/vbernat/haproxy-2.8/${distro_name}/ ${distro_codename} main'  }}
      - { name: nginx       ,description: 'Nginx'            ,module: infra ,releases: [20,22] ,baseurl: { default: 'http://nginx.org/packages/${distro_name}/  ${distro_codename} nginx' }}
#      - { name: docker-ce   ,description: 'Docker'           ,module: infra ,releases: [20,22] ,baseurl: { default: 'https://download.docker.com/linux/${distro_name}/ ${distro_codename} stable' ,china: 'https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/${distro_name}/ ${distro_codename} stable' }}
      - { name: grafana     ,description: 'Grafana'          ,module: infra ,releases: [20,22] ,baseurl: { default: 'https://apt.grafana.com stable main' ,china: 'https://mirrors.tuna.tsinghua.edu.cn/grafana/apt/ stable main' }}
      - { name: infra       ,description: 'Pigsty Infra'     ,module: infra ,releases: [20,22] ,baseurl: { default: 'https://repo.pigsty.cc/deb/infra/amd64/ ./' }} # prometheus-deb packages
      - { name: pgdg        ,description: 'PGDG'             ,module: pgsql ,releases: [20,22] ,baseurl: { default: 'http://apt.postgresql.org/pub/repos/apt/ ${distro_codename}-pgdg main' ,china: 'https://mirrors.tuna.tsinghua.edu.cn/postgresql/repos/apt/ ${distro_codename}-pgdg main' }}
      - { name: citus       ,description: 'Citus'            ,module: pgsql ,releases: [20,22] ,baseurl: { default: 'https://packagecloud.io/citusdata/community/${distro_name}/ ${distro_codename} main'   }}
      - { name: timescaledb ,description: 'Timescaledb'      ,module: pgsql ,releases: [20,22] ,baseurl: { default: 'https://packagecloud.io/timescale/timescaledb/${distro_name}/ ${distro_codename} main' }}
      - { name: pgsql       ,description: 'Pigsty PgSQL'     ,module: pgsql ,releases: [20,22] ,baseurl: { default: 'https://repo.pigsty.cc/deb/pgsql/${distro_codename}.amd64/ ./' }}
      - { name: redis       ,description: 'Pigsty Redis'     ,module: redis ,releases: [20,22] ,baseurl: { default: 'https://packages.redis.io/deb ${distro_codename} main' }}
      - { name: minio       ,description: 'Pigsty MinIO'     ,module: minio ,releases: [20,22] ,baseurl: { default: 'https://repo.pigsty.cc/deb/minio/amd64/ ./' ,europe: 'https://packagecloud.io/pigsty/minio/ubuntu/ jammy main' }}
    repo_packages:                    # which packages to be included
      - ansible python3 python3-pip python3-venv python3-jmespath dpkg-dev
      - grafana loki logcli promtail prometheus2 alertmanager pushgateway blackbox-exporter
      - node-exporter pg-exporter nginx-exporter redis-exporter mysqld-exporter mongodb-exporter kafka-exporter keepalived-exporter
      - lz4 unzip bzip2 zlib1g pv jq git ncdu make patch bash lsof wget uuid tuned nvme-cli numactl sysstat iotop htop rsync tcpdump linux-tools-generic
      - netcat socat ftp lrzsz net-tools ipvsadm dnsutils telnet ca-certificates openssl openssh-client libreadline-dev vim-tiny keepalived acl
      - redis minio mcli etcd haproxy vip-manager nginx sshpass chrony dnsmasq docker-ce docker-compose-plugin ferretdb sealos
      - patroni pgbouncer pgbackrest pgbadger pgloader pg-activity pgloader pg-activity postgresql-filedump pgxnclient pgformatter
      - postgresql-client-16 postgresql-16 postgresql-server-dev-16 postgresql-plpython3-16 postgresql-plperl-16 postgresql-pltcl-16 postgresql-16-wal2json postgresql-16-repack
      - postgresql-client-15 postgresql-15 postgresql-server-dev-15 postgresql-plpython3-15 postgresql-plperl-15 postgresql-pltcl-15 postgresql-15-wal2json postgresql-15-repack
      - postgresql-client-14 postgresql-14 postgresql-server-dev-14 postgresql-plpython3-14 postgresql-plperl-14 postgresql-pltcl-14 postgresql-14-wal2json postgresql-14-repack
      - postgresql-client-13 postgresql-13 postgresql-server-dev-13 postgresql-plpython3-13 postgresql-plperl-13 postgresql-pltcl-13 postgresql-13-wal2json postgresql-13-repack
      - postgresql-client-12 postgresql-12 postgresql-server-dev-12 postgresql-plpython3-12 postgresql-plperl-12 postgresql-pltcl-12 postgresql-12-wal2json postgresql-12-repack
      - postgresql-15-postgis-3 postgresql-15-postgis-3-scripts postgresql-15-citus-12.1 postgresql-15-pgvector timescaledb-2-postgresql-15 pg-graphql pg-net postgresql-pgml-15  # pgml-15 not available in ubuntu20
      - postgresql-16-postgis-3 postgresql-16-postgis-3-scripts postgresql-16-citus-12.1 postgresql-16-pgvector timescaledb-2-postgresql-16
      - postgresql-15-credcheck postgresql-15-cron postgresql-15-debversion postgresql-15-decoderbufs postgresql-15-dirtyread postgresql-15-extra-window-functions postgresql-15-first-last-agg
      - postgresql-15-hll postgresql-15-hypopg postgresql-15-icu-ext postgresql-15-ip4r postgresql-15-jsquery postgresql-15-londiste-sql postgresql-15-mimeo postgresql-15-mysql-fdw postgresql-15-numeral
      - postgresql-15-ogr-fdw postgresql-15-omnidb postgresql-15-oracle-fdw postgresql-15-orafce postgresql-15-partman postgresql-15-periods postgresql-15-pg-catcheck postgresql-15-pg-checksums
      - postgresql-15-pg-fact-loader postgresql-15-pg-qualstats postgresql-15-pg-stat-kcache postgresql-15-pg-track-settings postgresql-15-pg-wait-sampling postgresql-15-pgaudit postgresql-15-pgauditlogtofile
      - postgresql-15-pgextwlist postgresql-15-pgfincore postgresql-15-pgl-ddl-deploy postgresql-15-pglogical postgresql-15-pglogical-ticker postgresql-15-pgmemcache postgresql-15-pgmp
      - postgresql-15-pgpcre postgresql-15-pgq-node postgresql-15-pgq3 postgresql-15-pgsphere postgresql-15-pgtap postgresql-15-pldebugger postgresql-15-pllua postgresql-15-plpgsql-check
      - postgresql-15-plprofiler postgresql-15-plproxy postgresql-15-plsh postgresql-15-pointcloud postgresql-15-powa postgresql-15-prefix postgresql-15-preprepare postgresql-15-prioritize
      - postgresql-15-q3c postgresql-15-rational postgresql-15-rum postgresql-15-semver postgresql-15-set-user postgresql-15-show-plans postgresql-15-similarity postgresql-15-squeeze
      - postgresql-15-tablelog postgresql-15-tdigest postgresql-15-tds-fdw postgresql-15-toastinfo postgresql-15-topn postgresql-15-unit postgresql-15-rdkit # 15-rdkit not available in ubuntu20
    pg_dbsu_uid: 543
    node_repo_local_urls:
      - 'deb [trusted=yes] http://${admin_ip}:5011/pigsty ./'
    infra_packages:                   # packages to be installed on infra nodes
      - grafana,loki,logcli,promtail,prometheus2,alertmanager,pushgateway,blackbox-exporter
      - node-exporter,blackbox-exporter,nginx-exporter,redis-exporter,pg-exporter
      - nginx,dnsmasq,ansible,postgresql-client-16,redis,mcli,etcd,python3-requests
    node_default_packages:            # default node packages to be installed on ubuntu22 node
      - lz4,unzip,bzip2,zlib1g,pv,jq,git,ncdu,make,patch,bash,lsof,wget,uuid,tuned,linux-tools-generic,nvme-cli,numactl,sysstat,iotop,htop,rsync,tcpdump,acl,python3,python3-pip
      - netcat,socat,ftp,lrzsz,net-tools,ipvsadm,dnsutils,telnet,ca-certificates,openssl,openssh-client,libreadline-dev,vim-tiny,keepalived,node-exporter,etcd,haproxy
    pg_packages:                      # pg packages to be installed, `${pg_version}` will be replaced
      - postgresql-*-${pg_version}
      - patroni pgbouncer pgbackrest pg-exporter pgbadger vip-manager
    pg_extensions:                    # pg extensions to be installed, `${pg_version}` will be replaced
      - postgresql-${pg_version}-wal2json postgresql-${pg_version}-repack
      - timescaledb-2-postgresql-${pg_version} postgresql-${pg_version}-pgvector
      - postgresql-${pg_version}-postgis-3 # postgis-3 broken in ubuntu20
...
EOF

生成最终的配置文件:
参数:
- -m|--mode: 直接指定配置模板 : (auto|demo|sec|citus|el8|el9|prod...)
- -i|--ip: 用于替换IP地址占位符 10.10.10.10 的IP地址，即当前主机的首要内网IP地址（特别是在有多块网卡与多个IP地址时）
- -r|--region: 用于指定上游源的区域： (default|china|europe)
- -n|--non-interactive: 直接使用命令行参数提供首要IP地址，跳过交互式向导。
当使用 -n|--non-interactive 参数时，您需要使用 -i|--ip <ipaddr> 指定当前节点的首要IP地址，特别是在有多块网卡与多个IP地址时
```shell
cd ~/pigsty
./configure  -r china -i $HOST_MASTER -m pg-config
```

安装: 这个运行过程漫长, 与你机器配置息息相关
```shell
cd ~/pigsty
./install.yml
```

### [监控外部PG](https://pigsty.cc/doc/#/zh/PARAM?id=pg_cluster)
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
