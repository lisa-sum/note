
## 安装

### 初始化目录
定义目录: 将HARBOR_HOME的值替换为你喜欢的路径, 例如`/home/harbor`
```sh
export HARBOR_HOME="/home/harbor"

mkdir -p $HARBOR_HOME/logs
mkdir -p $HARBOR_HOME/data

cd $HARBOR_HOME

访问 https://github.com/goharbor/harbor/releases/ 查看版本并把 VERSION 变量替换为指定版本

export VERSION="v2.10.0"
wget https://github.com/goharbor/harbor/releases/download/${VERSION}/harbor-offline-installer-${VERSION}.tgz
cat $HARBOR_HOME/conf/harbor.yml.tmpl
```
### 安装包

访问 https://github.com/goharbor/harbor/releases/ 查看版本并把 VERSION 变量替换为指定版本:

```shell
export VERSION="v2.10.0"
wget https://github.com/goharbor/harbor/releases/download/${VERSION}/harbor-offline-installer-${VERSION}.tgz

cat $HARBOR_HOME/conf/harbor.yml.tmpl
```

## 配置

**如果是正式使用, 查看官方的[配置文件](https://goharbor.io/docs/2.10.0/install-config/configure-yml-file/)进行详细的修改**

创建配置文件, 别修改该文件名, 安装时默认使用该文件进行配置: 
```shell
cd $HARBOR_HOME
vi harbor.yml
```
然后把配置写入到该文件, 以下是推荐的设置, 先查看,然后注重几点:
- hostname: 当前域名/主机IP
- 账号: admin
- 密码: msdnmm
- HTTP端口: 5080
- HTTPS: 禁用

```yaml
# Source: harbor.yml
# Configuration file of Harbor

# The IP address or hostname to access admin UI and registry service.
# DO NOT use localhost or 127.0.0.1, because Harbor needs to be accessed by external clients.
hostname: 192.168.2.158

# http related config
http:
  # port for http, default is 80. If https enabled, this port will redirect to https port
  port: 5080

# https related config
#https:
  # https port for harbor, default is 443
  #port: 5443
  # The path of cert and key files for nginx
  #certificate: /your/certificate/path
  #private_key: /your/private/key/path

# The initial password of Harbor admin
# It only works in first time to install harbor
# Remember Change the admin password from UI after launching Harbor.
harbor_admin_password: msdnmm

# Harbor DB configuration
database:
  # The password for the root user of Harbor DB. Change this before any production use.
  password: root123
  # The maximum number of connections in the idle connection pool. If it <=0, no idle connections are retained.
  max_idle_conns: 100
  # The maximum number of open connections to the database. If it <= 0, then there is no limit on the number of open connections.
  # Note: the default number of connections is 1024 for postgres of harbor.
  max_open_conns: 900
  # The maximum amount of time a connection may be reused. Expired connections may be closed lazily before reuse. If it <= 0, connections are not closed due to a connection's age.
  # The value is a duration string. A duration string is a possibly signed sequence of decimal numbers, each with optional fraction and a unit suffix, such as "300ms", "-1.5h" or "2h45m". Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h".
  conn_max_lifetime: 5m
  # The maximum amount of time a connection may be idle. Expired connections may be closed lazily before reuse. If it <= 0, connections are not closed due to a connection's idle time.
  # The value is a duration string. A duration string is a possibly signed sequence of decimal numbers, each with optional fraction and a unit suffix, such as "300ms", "-1.5h" or "2h45m". Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h".
  conn_max_idle_time: 0

# The default data volume
data_volume: /home/harbor/data

# Trivy configuration
#
# Trivy DB contains vulnerability information from NVD, Red Hat, and many other upstream vulnerability databases.
# It is downloaded by Trivy from the GitHub release page https://github.com/aquasecurity/trivy-db/releases and cached
# in the local file system. In addition, the database contains the update timestamp so Trivy can detect whether it
# should download a newer version from the Internet or use the cached one. Currently, the database is updated every
# 12 hours and published as a new release to GitHub.
trivy:
  # ignoreUnfixed The flag to display only fixed vulnerabilities
  ignore_unfixed: false
  # skipUpdate The flag to enable or disable Trivy DB downloads from GitHub
  #
  # You might want to enable this flag in test or CI/CD environments to avoid GitHub rate limiting issues.
  # If the flag is enabled you have to download the `trivy-offline.tar.gz` archive manually, extract `trivy.db` and
  # `metadata.json` files and mount them in the `/home/scanner/.cache/trivy/db` path.
  skip_update: false
  #
  # The offline_scan option prevents Trivy from sending API requests to identify dependencies.
  # Scanning JAR files and pom.xml may require Internet access for better detection, but this option tries to avoid it.
  # For example, the offline mode will not try to resolve transitive dependencies in pom.xml when the dependency doesn't
  # exist in the local repositories. It means a number of detected vulnerabilities might be fewer in offline mode.
  # It would work if all the dependencies are in local.
  # This option doesn't affect DB download. You need to specify "skip-update" as well as "offline-scan" in an air-gapped environment.
  offline_scan: false
  #
  # Comma-separated list of what security issues to detect. Possible values are `vuln`, `config` and `secret`. Defaults to `vuln`.
  security_check: vuln
  #
  # insecure The flag to skip verifying registry certificate
  insecure: false

jobservice:
  # Maximum number of job workers in job service
  max_job_workers: 10
  # The jobLoggers backend name, only support "STD_OUTPUT", "FILE" and/or "DB"
  job_loggers:
    - STD_OUTPUT
    - FILE
    # - DB
  # The jobLogger sweeper duration (ignored if `jobLogger` is `stdout`)
  logger_sweeper_duration: 1 #days

notification:
  # Maximum retry count for webhook job
  webhook_job_max_retry: 3
  # HTTP client timeout for webhook job
  webhook_job_http_client_timeout: 3 #seconds

# Log configurations
log:
  # options are debug, info, warning, error, fatal
  level: info
  # configs for logs in local storage
  local:
    # Log files are rotated log_rotate_count times before being removed. If count is 0, old versions are removed rather than rotated.
    rotate_count: 50
    # Log files are rotated only if they grow bigger than log_rotate_size bytes. If size is followed by k, the size is assumed to be in kilobytes.
    # If the M is used, the size is in megabytes, and if G is used, the size is in gigabytes. So size 100, size 100k, size 100M and size 100G
    # are all valid.
    rotate_size: 200M
    # The directory on your host that store log
    # 设置日志的存储目录
    location: /home/harbor/logs

#This attribute is for migrator to detect the version of the .cfg file, DO NOT MODIFY!
_version: 2.10.0

proxy:
  http_proxy:
  https_proxy:
  no_proxy:
  components:
    - core
    - jobservice
    - trivy

upload_purging:
  enabled: true
  # remove files in _upload directories which exist for a period of time, default is one week.
  age: 168h
  # the interval of the purge operations
  interval: 24h
  dryrun: false

cache:
  # not enabled by default
  enabled: false
  # keep cache for one day by default
  expire_hours: 24

```

## 使用

把harbor配置文件上传到`$HARBOR_HOME/`中

安装:
```shell
cd $HARBOR_HOME

chmod +x ./install.sh
./install.sh
```

查看docker安装的信息:
```shell
docker ps
```

## 注意事项
如果是HTTP, 必须修改和重启
在`/etc/docker/daemon.json`的insecure-registries添加horbor暴露对应的IP和端口
```json
{
	"insecure-registries":["192.168.0.226","0.0.0.0","192.168.2.158:5000","192.168.2.158:6080"],
}
```

更新 `daemon.json` 后，必须重新启动 Docker Engine 和 Harbor。

1. Restart Docker Engine. 重启 Docker Engine。
    ```sh
    systemctl restart docker
    ```
2. Stop Harbor. 停止港口。
    ```sh
    docker-compose down -v
    ```
3. Restart Harbor. 重启 Harbor。
    ```sh
    docker-compose up -d
    ```

## 资料
1. [配置文件](https://goharbor.io/docs/2.10.0/install-config/configure-yml-file/)
2. [运行脚本](https://goharbor.io/docs/2.10.0/install-config/run-installer-script/#connect-http)
3. [文档](https://goharbor.io/docs)