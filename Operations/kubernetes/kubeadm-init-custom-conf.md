```yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
bootstrapTokens:
  - groups:
      - system:bootstrappers:kubeadm:default-node-token # 指定用于节点引导的安全组
    token: "9a08jv.c0izixklcxtmnze7" # 引导令牌，用于节点加入集群时的验证
    ttl: 24h0m0s # 令牌的有效期限
    usages:
      - signing # 用于签名请求
      - authentication # 用于身份验证
localAPIEndpoint:
  advertiseAddress: 192.168.2.152 # masterIP 主节点用于广播的地址
  bindPort: 6443 # Kubernetes API 服务器监听的端口
nodeRegistration:
  name: "master-node-152" # 该控制节点的名称, 也就是出现在kubectl get no的名称
  criSocket: unix:///var/run/containerd/containerd.sock # CRI（容器运行时接口）的通信 socket 用来读取容器运行时的信息。 此信息会被以注解的方式添加到 Node API 对象至上，用于后续用途。
  imagePullPolicy: IfNotPresent  # 镜像拉取策略。 这两个字段的值必须是 "Always"、"Never" 或 "IfNotPresent" 之一。 默认值是 "IfNotPresent"，也是添加此字段之前的默认行为
  taints: null # 定 Node API 对象被注册时要附带的污点。 若未设置此字段（即字段值为 null），默认为控制平面节点添加控制平面污点。 如果你不想污染你的控制平面节点，可以将此字段设置为空列表
  ignorePreflightErrors: # 提供一组在当前节点被注册时可以忽略掉的预检错误。 例如：IsPrevilegedUser,Swap。 取值 all 忽略所有检查的错误。
    - IsPrivilegedUser
#skipPhases: # 是命令执行过程中要略过的阶段（Phases）。 通过执行命令 kubeadm init --help 可以获得阶段的列表。 参数标志 "--skip-phases" 优先于此字段的设置
#  - addon/kube-proxy # 忽略kube-proxy, 许多CNI网络插件都可以代替kube-proxy的功能, 此时可以省略, 除非你真的很懂, 否则不要跳过
---
apiServer:
  certSANs: # certSANs 设置 API 服务器签署证书所用的额外主题替代名（Subject Alternative Name，SAN）。
    # 集群中各个节点的 IP 地址、域名、负载均衡、或者集群的公共访问地址作为 certSANs 字段的值
    - 192.168.2.152
    - "master-node-152"
    - 192.168.2.155
    - "worker-node-155"
    - 192.168.2.160
    - "worker-node-160"
    - 192.168.2.100
    - "worker-node-100"
    - 192.168.2.101
    - "worker-node-101"
    - 192.168.2.102
    - "worker-node-102"
    - "kubernetes"
    - "kubernetes.default"
    - "kubernetes.default.svc"
    - "kubernetes.default.svc.cluster.local"
  extraArgs:
    authorization-mode: Node,RBAC # API 服务器的授权模式
#  extraVolumes:
#    - name: "some-volume"
#      hostPath: "/etc/some-path"
#      mountPath: "/etc/some-pod-path"
#      readOnly: false
#      pathType: File
  timeoutForControlPlane: 1m0s # 控制平面的超时时间
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: 1.29.0 # 版本信息
certificatesDir: /etc/kubernetes/pki # 证书目录路径
clusterName: kubernetes # 集群名称。
controllerManager: {} # 控制器管理器配置
dns: {} # DNS 配置
etcd: # etcd 数据库的配置。例如使用这个部分可以定制本地 etcd 或者配置 API 服务器 使用一个外部的 etcd 集群。
  local:
    dataDir: /var/lib/etcd # etcd 数据存储目录
#    imageRepository: "registry.k8s.io"
#    imageTag: "3.2.24"
#    extraArgs:
#      listen-client-urls: "http://10.100.0.1:2379"
#    serverCertSANs:
#      - "ec2-10-100-0-1.compute-1.amazonaws.com"
#    peerCertSANs:
#      - "10.100.0.1"
# external:
#   endpoints:
#   - "10.100.0.1:2379"
#   - "10.100.0.2:2379"
#   caFile: "/etcd/kubernetes/pki/etcd/etcd-ca.crt"
#   certFile: "/etcd/kubernetes/pki/etcd/etcd.crt"
#   keyFile: "/etcd/kubernetes/pki/etcd/etcd.key"
imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers # 镜像源
# 为控制面设置一个稳定的 IP 地址或 DNS 名称。
# 取值可以是一个合法的 IP 地址或者 RFC-1123 形式的 DNS 子域名，二者均可以带一个 可选的 TCP 端口号。
# 如果 controlPlaneEndpoint 未设置，则使用 advertiseAddress + bindPort。 如果设置了 controlPlaneEndpoint，但未指定 TCP 端口号，则使用 bindPort。
# 可能的用法有：
# 在一个包含不止一个控制面实例的集群中，该字段应该设置为放置在控制面 实例之前的外部负载均衡器的地址。
# 在带有强制性节点回收的环境中，controlPlaneEndpoint 可以用来 为控制面设置一个稳定的 DNS。
controlPlaneEndpoint: 192.168.2.152:6443 # 负载均衡地址或者master的主机
networking: # 其中包含集群的网络拓扑配置。使用这一部分可以定制 Pod 的 子网或者 Service 的子网。
  dnsDomain: cluster.local # Kubernetes 服务所使用的的 DNS 域名。 默认值为 "cluster.local"。
  podSubnet: 10.244.0.0/16 # 为 Pod 所使用的子网
  serviceSubnet: 10.96.0.0/12 # Kubernetes 服务所使用的的子网。 默认值为 "10.96.0.0/12"。
scheduler: {} # 调度器配置
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs

```