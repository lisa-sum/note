## 先决条件
1. 使用kubectl和kubeadm引导的集群
2. 安装的Kubernetes版本大于v1.19

## 名词解释
1. PV: 持久卷（Persistent Volume），是 Kubernetes 集群中的一种资源对象，用于提供持久化存储。PV 独立于 Pod 存在，可以在 Pod 之间共享。它可以由集群管理员手动配置，也可以由 StorageClass 动态配置。
2. SC: 存储类(StorageClass)，是 Kubernetes 中用于动态配置 PV 的对象。它定义了动态配置 PV 的策略，包括存储提供商、卷类型、复制策略等。
3. PVC: 持久卷声明(Persistent Volume Claim)，是 Pod 对 PV 的请求。PVC 允许用户声明自己需要的存储资源，而不需要关心实际的存储类型。
4. MinIO Kubernetes Operator: MinIO提供的一种Kubernetes Operator，用于在 Kubernetes 上部署和管理 MinIO 对象存储服务。它简化了 MinIO 集群的部署和管理过程。
5. MinIO Tenant: MinIO Tenant 是 MinIO 对象存储中的一个概念，指的是在 MinIO 集群中的一个用户或租户。每个 MinIO Tenant 都有自己的资源配额和权限控制。
6. MinIO Operator Console: MinIO Kubernetes Operator 的管理界面，用于管理员配置和管理 MinIO 集群。
7. MinIO Console: MinIO Console 是 MinIO 对象存储服务的用户控制台，用于用户管理和操作 MinIO 存储桶、对象等资源。
8. SLB: Service Load Balancer，是一种网络负载均衡技术，用于将传入的网络流量分发到多个后端服务器上，以提高系统的可用性和性能。在 Kubernetes 中，SLB 通常用于将流量分发到集群中的不同 Pod 上，以实现服务的高可用性和水平扩展。
## 与本文相关的文章
1. [安装Kubernetes](https://juejin.cn/post/7292041370893778983)
1. [Kubernetes裸金属使用OpenELB搭建LoadBalancer负载均衡器](https://juejin.cn/post/7313728275787808808)

## 使用

### 部署MinIO Operator
1. 下载安装kubectl-minio, 将kubectl_minio_version替换为你喜欢的版本, 最新为v5.0.11
    ```Bash
    kubectl_minio_version=v5.0.11
    wget -O kubectl-minio https://github.com/minio/operator/releases/download/${kubectl_minio_version}/kubectl-minio_5.0.11_linux_amd64 
    chmod +x kubectl-minio
    mv kubectl-minio  /usr/bin/kubectl-minio
    ```
2. 校验, 输出应将 Operator 版本显示为 5.0.11
    ```Bash
    kubectl minio version
    ```
3. 配置PV(Kubernetes的持久卷)
> 这里仅为使用本地的PV作为持久卷,使用快速测试使用, 正式环境和线上环境自行查询其他方式进行配置SC与PV与PVC

### 配置PV
1. 下载local-path-provisioner作为本地PV, 访问 https://github.com/rancher/local-path-provisioner 查看进行详细安装, 这里只列出本文所需的安装配置部分
稳定版:
    ```Bash
    wget https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.26/deploy/local-path-storage.yaml
    kubectl apply -f local-path-storage.yaml
    ```
2. 检查安装安装的Pod, SC/PV/PVC是否成功配置
    ```Bash
    kubectl -n local-path-storage get pod
    
    kubectl get sc,pv,pvc
    ```
#### 测试
1. 写入内容
    ```Bash
    kubectl exec volume-test -- sh -c "echo local-path-test > /data/test"
    ```

2. 删除Pod
    ```Bash
    kubectl delete -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/examples/pod/pod.yaml 
    ```

3. 再次应用Pod
    ```Bash
    kubectl delete -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/examples/pod/pod.yaml
    ```

4. 验证新安装的Pod存在删除Pod之后的数据是否存在, 如果有输出, 说明配置本地PV成功
    ```Bash
    kubectl exec volume-test -- sh -c "cat /data/test"
    ```
### 初始化
参数:
- --console-tls: 启用TLS
- --cluster-domain 设置不同的群集域值。默认值: cluster.local

```Bash
kubectl minio init
```

**保存初始化之后的TOKEN值**
### 部署用户
#### 对外访问
- kubectl minio方式(临时在本机开启):
```shell
kubectl minio proxy
```

- LoadBalancer/NodePort方式:
修改`minio-operator`的配置文件:
```shell
kubectl etid svc -n minio-operator console
```

修改`type`字段为`LoadBalancer`或`NodePort`, LoadBalancer类型需要集群拥有SLB的能力
```shell
...
  ports:
  - name: http
    nodePort: 30355
    port: 9090
    protocol: TCP
    targetPort: 9090
  - name: https
    nodePort: 32555
    port: 9443
    protocol: TCP
    targetPort: 9443
  selector:
    app: console
  sessionAffinity: None
  type: LoadBalancer # 修改该字段的值
...
```
验证: 查看TYPE字段是否拥有刚刚修改的类型, 记住PORT参数的9090所对应的端口, 这是MinIO Operator控制台的端口
![[images/Pasted image 20231219190212.png]]
访问MinIO Operator控制台, 访问集群的负载均衡的IP+MinIO Operator控制台的端口, 输入你保存的TOKEN值
![[images/Pasted image 20231219190505.png]]
### [创建用户](https://min.io/docs/minio/kubernetes/upstream/operations/install-deploy-manage/deploy-minio-tenant.html#create-tenant-access-minio-operator-console)
单击`+ create tenant`以开始创建 MinIO 用户

> 标有星号 * 的设置是必需的：

|字段|描述|
|---|---|
|名字|用户的名称|
|命名空间|要在其中部署租户的 Kubernetes 命名空间。如果命名空间不存在，则可以通过选择加号 + 图标来创建命名空间。每个命名空间最多支持一个 MinIO 租户。|
|存储类|指定操作员在为租户生成持久性卷声明时使用的 Kubernetes 存储类。确保指定的存储类具有足够的可用持久卷资源，以匹配每个生成的持久卷声明。|
|要在租户中部署的 MinIO 服务器 Pod 的总数。Operator 强制每个租户至少使用 4 个服务器 Pod。默认情况下，Operator 使用 Pod 反亲和性，因此 Kubernetes 集群的每个 MinIO 服务器 Pod 必须至少有一个工作节点。使用容器放置窗格可以修改租户的容器计划设置。|
|Operator 为每个服务器请求的存储卷（持久卷声明）数。Operator 在资源分配部分下显示总卷。Operator 生成相同数量的 PVC 加上两个用于支持租户服务（指标和日志搜索）的 PVC。<br>指定的存储类必须对应于一组数量足以匹配每个生成的 PVC 的持久卷。|
|总面积|租户的总原始存储大小。指定总存储大小和该存储的单位。所有存储单元均以 SI 值为单位，Operator 在 ：guilabel：Resource Allocation 部分下显示驱动器容量。Operator 将此值设置为每个生成的 PVC 中请求的存储容量。指定的存储类必须对应于一组容量足以匹配每个生成的 PVC 的持久卷。|
|memory per node [gi] 每个节点的内存 [gi]| 指定要为每个 MinIO 服务器 Pod 分配的内存总量 （RAM）。有关设置此值的指导，请参阅内存。Kubernetes 集群必须具有具有足够可用 RAM 的工作节点来匹配 Pod 请求。|
|纠删码奇偶校验|要为部署设置的纠删码奇偶校验。Operator 在纠删码配置部分下显示选定的奇偶校验及其对部署的影响。纠删码奇偶校验定义了群集上数据的整体弹性和可用性。更高的奇偶校验值增加了对驱动器或节点故障的容忍度，但代价是总存储。有关更完整的文档，请参阅纠删码。|

选择Create以使用当前配置创建租户。虽然所有后续部分都是可选的，但 MinIO 建议在部署租户之前查看它们

### 访问用户控制台

检查刚刚创建的用户是否正确, 使用以下命令: 将`minio-tenant-1`替换为你刚刚创建时使用的名字
```shell
kubectl get svc -n minio-tenant-1
```
- 该 `minio`service对应于 MinIO 租户服务。应用程序应使用此服务对 MinIO 租户执行操作。
- 该 `*-console` 服务对应于 MinIO 控制台。管理员应使用此服务访问 MinIO 控制台并在 MinIO 租户上执行管理操作。
其余服务支持租户操作，不供用户或管理员使用。
默认情况下，每个服务仅在 Kubernetes 集群中可见。部署在集群内的应用程序可以使用 `CLUSTER-IP` 访问服务。你可以参考本文的[[#对外访问]]步骤操作

## 资料
1. [安装页面](https://min.io/docs/minio/kubernetes/upstream/operations/installation.html)
2. [详细安装教程](https://min.io/docs/minio/kubernetes/upstream/operations/install-deploy-manage/deploy-minio-tenant.html#create-tenant-deploy-view-tenant)
3. [本地持久化卷](https://github.com/rancher/local-path-provisioner)