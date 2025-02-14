---
title: redis安装部署
tags:
  - redis
createTime: 2025/02/14 15:23:31
permalink: /article/48z2y9bu/
---

## 1 Redis安装（linux）

[redis下载地址](https://redis.io/download) （下载选择 Stable 版本）

### 1.1 解压缩

首先通过rz或sftp等方式将压缩包放进来

```shell
tar -zvxf redis-6.2.6.tar.gz
```

### 1.2 安装c语言环境

```shell
yum install gcc-c++
```

### 1.3 编译安装

```shell
/opt/module/redis-6.2.6
make
make PREFIX=/opt/module/redis-6.2.6 install
```

## 2 Redis运行

进入bin目录 - `cd /opt/module/redis-6.2.6`

### 2.1 启动

```shell
bin/redis-server redis.conf
```

## 3 redis修改密码和端口

### 3.1 修改密码

```shell
# 注意：默认没有密码
vim /etc/redis.conf
# 找到 requirepass，打开注释，foobared去掉，改成密码
# /requirepass foobared 
```

### 3.2 修改端口号

```shell
vim /etc/redis.conf
# 找到 port,修改后直接保存即可
/port 6379
```
