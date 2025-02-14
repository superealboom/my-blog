---
title: 安装jdk
tags:
  - java
createTime: 2025/02/14 15:59:39
permalink: /article/4sshpcr6/
---

## 1 查看是否有jdk

```shell
rpm -qa | grep java
```

## 2 查看yum能装的jdk版本

```shell
yum search java|grep jdk
```

## 3 列出 jdk 版本(1.8)

```shell
yum --showduplicate list java* | grep 1.8.0
```

## 4 安装

```shell
yum -y install java-1.8.0-openjdk java-1.8.0-openjdk-devel.x86_64
```

## 5 查看是否配置JAVA_HOME

```shell
echo $JAVA_HOME
```

## 6 查看java安装地址

```shell
whereis java
```

## 7 设置环境变量

```shell
vim /etc/profile

export JAVA_HOME=/usr/lib/jvm/jre-1.8.0-openjdk-1.8.0.402.b06-1.el7_9.x86_64/
export JRE_HOME=$JAVA_HOME/jre
export CLASSPATH=$CLASSPATH:$JAVA_HOME/lib:$JAVA_HOME/jre/lib
PATH=$PATH:$JAVA_HOME/bin:$JRE_HOME/bin
```
