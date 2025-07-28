---
title: docker使用
tags:
  - docker
createTime: 2025/02/13 21:30:27
permalink: /article/zu6fynr2/
---
## yum 准备

```shell
# 更新yum
sudo yum update

# 安装工具包
sudo yum install -y yum-utils
```

## docker 设置镜像

```shell
# 官方
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 阿里镜像
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 腾讯镜像
sudo yum-config-manager --add-repo https://mirrors.cloud.tencent.com/dockerce/linux/centos/docker-ce.repo
```

## docker 查看安装包

```shell
yum list installed | grep docker
```
出现下图：
```shell
Repository base is listed more than once in the configuration
Repository updates is listed more than once in the configuration
Repository extras is listed more than once in the configuration
Repository centosplus is listed more than once in the configuration
containerd.io.x86_64                1.6.33-3.1.el7                     @docker-ce-stable
docker-buildx-plugin.x86_64         0.14.1-1.el7                       @docker-ce-stable
docker-ce.x86_64                    3:26.1.4-1.el7                     @docker-ce-stable
docker-ce-cli.x86_64                1:26.1.4-1.el7                     @docker-ce-stable
docker-ce-rootless-extras.x86_64    26.1.4-1.el7                       @docker-ce-stable
docker-compose-plugin.x86_64        2.27.1-1.el7                       @docker-ce-stable
```
## docker 卸载
```shell
sudo yum remove docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine
```
## docker 安装和设置

```shell
# 安装
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动
sudo systemctl start docker

# 开机自启动
sudo systemctl enable docker

# 查看版本
docker -v

```

## 容器镜像加速地址

```shell
sudo tee /etc/docker/daemon.json <<-'EOF'
{
"registry-mirrors": ["https://mirror.ccs.tencentyun.com"] # 可以替换成其他地址
}
EOF

sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://docker.m.daocloud.io",
        "https://docker.1panel.live",
        "https://hub.rat.dev"
    ]
}
EOF
```

## 其他命令

```shell
# 重载配置
sudo systemctl daemon-reload

# 重启docker
sudo systemctl restart docker
```

## docker复制文件

```shell
# 查看容器id
docker ps -a
# 复制容器内文件到本地
docker cp 容器ID:目标文件路径 本地文件路径
# 复制本地文件到容器
docker cp 本地文件路径 容器ID:容器内文件夹
```
## docker服务自启动
```shell
# docker服务创建启动时增加参数
docker run –restart=always
# 如果已经启动了，增加自启动
docker update –restart=always <CONTAINER ID>
# docker-compose配置自启动
restart: always
# 关闭自启动
docker update --restart=no <CONTAINER ID>
# 所有容器都关闭
docker update --restart=no $(docker ps -q)
```
