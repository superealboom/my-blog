---
title: docker使用
tags:
  - docker
createTime: 2025/02/13 21:30:27
permalink: /article/zu6fynr2/
---
## 查看docker安装包
```shell
yum list installed | grep docker
```
出现下图：
```shell
Repository epel is listed more than once in the configuration
docker-ce.x86_64                     3:20.10.11-3.el8                        @docker-ce-stable
docker-ce-cli.x86_64                 1:20.10.11-3.el8                        @docker-ce-stable
docker-ce-rootless-extras.x86_64     20.10.11-3.el8                          @docker-ce-stable
docker-scan-plugin.x86_64            0.9.0-3.el8     
```
## 卸载docker
```shell
yum remove docker-ce.x86_64 docker-ce-cli.x86_64  docker-ce-rootless-extras.x86_64 docker-scan-plugin.x86_64
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
