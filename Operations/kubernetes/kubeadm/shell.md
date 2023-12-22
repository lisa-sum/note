## kubeadm create

获取加入命令
```shell
kubeadm token create --print-join-command
```

## kubeadm config 

生成要下载的镜像列表
```shell
kubeadm config images list
```

## kubeadm print
查看默认的kubeadm 配置并打印到kubeadm-init-conf.yaml
```shell
kubeadm print init-defaults > kubeadm-init-conf.yaml
```

## kubeadm init
- --kubernetes-version: Kubernetes版本
- --control-plane-endpoint: 为控制平面指定稳定的 IP 地址或 DNS 名称, 例如:`192.168.0.152`, `cluster-endpoint`
- --apiserver-bind-port: apiserver要绑定到的端口
- --image-repository: 镜像仓库的地址, 国内服务器推荐替换为阿里云源:`registry.cn-hangzhou.aliyuncs.com/google_containers`
- --service-cidr: Use alternative range of IP address for service VIPs
- --[pod-network-cidr](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network): 指定容器网络的 IP 地址范围。如果设置，控制平面将自动为每个节点分配 CIDR
- --upload-certs:用来将在所有控制平面实例之间的共享证书上传到集群. 相反，你更喜欢手动地通过控制平面节点或者使用自动化工具复制证书， 请删除此参数并参考如下部分[证书分配手册](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/high-availability/#manual-certs)
- --cri-socket: CRI(容器网络接口)的socket地址, 本文使用`containerd`作为容器运行时,默认是
`/run/containerd/containerd.sock`, 但有时候是`/var/run/containerd/containerd.sock`, 如果出现异常, 参考常见问题和该[issues](https://github.com/kubernetes/kubernetes/issues/110383)
- --v=5 详细的输出
- --ignore-preflight-errors=all: 忽略所有的异常, 除非你知道你在做什么,否则不要使用
```shell
kubeadm init \
--kubernetes-version=1.28.4 \
--control-plane-endpoint="192.168.0.152" \
--apiserver-bind-port="6443" \
--image-repository=registry.cn-hangzhou.aliyuncs.com/google_containers \
--service-cidr=10.96.0.0/12 \
--pod-network-cidr=10.244.0.0/16 \
--upload-certs \
--cri-socket=unix:///run/containerd/containerd.sock \
--v=5
```
## kubeadm init phase

要重新上传证书并生成新的解密密钥，请在已加入集群节点的控制平面上使用以下命令:
记录`certificate key`
```shell
kubeadm init phase upload-certs --upload-certs