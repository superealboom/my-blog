---
title: kafka服务端
tags:
  - kafka
createTime: 2025/02/13 22:17:06
permalink: /article/3ec6lv4u/
---

——>**前提是安装好 zookeeper**<——

## 1 Kafka安装

[kafka下载地址](http://kafka.apache.org/downloads) （我下载的是 - kafka_2.12-2.3.0.tgz 版本）

### 1.1 linux下创建目录

```Java
mkdir /opt/module
cd /opt/module
```

### 1.2 解压缩

首先通过rz或sftp等方式将压缩包放进来

```Java
tar -zxvf kafka_2.12-2.3.0.tgz
```

### 1.3 修改配置文件

```Java
cd /opt/module/kafka_2.12-2.3.0/config
vim server.properties
log.dirs=/tmp/kafka/logs #自定义kafka的日志地址
listeners=PLAINTEXT://:9092 #未打开就打开
advertised.listeners=PLAINTEXT://xxx:9092 #xxx是当前IP地址
```

### 1.4 创建日志目录

```Java
mkdir /tmp/kafka
mkdir /tmp/kafka/logs
```

## 2 Kafka运行

进入bin目录 - `cd /opt/module/kafka_2.12-2.3.0/bin`

### 2.1 启动

```Java
sh kafka-server-start.sh -daemon ../config/server.properties
```

### 2.2 停止

```Java
sh kafka-server-stop.sh ../config/server.properties
```

## 3 Kafka生产消费

进入bin目录 - `cd /opt/module/kafka_2.12-2.3.0/bin`

### 3.1 创建topic

```Java
sh kafka-topics.sh --create --zookeeper zookeeper:2181 --replication-factor 1 --partitions 1 --topic test
```

### 3.2 创建消费者

```Java
# --partitions 1 规定分区
# --from-beginning 从头开始打印
sh kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test
```

### 3.3 创建生产者

```Java
sh kafka-console-producer.sh --broker-list localhost:9092 --topic topic01
```

### 3.4 查看topic列表

```Java
sh kafka-topics.sh --list --zookeeper zookeeper:2181
```

### 3.5 查看topic信息

```Java
sh kafka-topics.sh --zookeeper zookeeper:2181 --topic test01 --describe
```

### 3.6 修改分区数量

```Java
# 分区数只能增加不能减小
sh kafka-topics.sh --zookeeper zookeeper:2181 -alter --partitions 3 --topic test02  
```

### 3.7 查看消费者组列表

```Java
sh kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --list
```

### 3.8 查看某个消费者组的消费情况

```Java
sh kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --group kafka-1 --describe
```

### 3.9 删除某个消费者组

```Java
sh kafka-consumer-groups.sh --bootstrap-server 127.0.0.1:9092 --delete --group kafka-1
```

## 4 异常

Replication factor: 1 larger than available brokers: 0

![image-20250213223303303](https://afuo-blog.oss-cn-beijing.aliyuncs.com/kafka.assets/image-20250213223303303.png)

zookeeper和kafka启动顺序反了，brokers未注册在zookeeper上

改掉顺序重新启动后，在zkCli.sh里查询brokers，发现注册上了，topic也可以生成了

![image-20250213223312736](https://afuo-blog.oss-cn-beijing.aliyuncs.com/kafka.assets/image-20250213223312736.png)

java.util.concurrent.ExecutionException: org.apache.kafka.common.errors.NotEnoughReplicasException: Messages are rejected since there are fewer in-sync replicas than required.

![image-20250213223322157](https://afuo-blog.oss-cn-beijing.aliyuncs.com/kafka.assets/image-20250213223322157.png)

## 5 过期时间

### 5.1 修改过期时间

```Java
./kafka-configs.sh --zookeeper zookeeper:2181 --alter --entity-name test --entity-type topics --add-config retention.ms=60000
```

### 5.2 查看过期时间

```Java
./kafka-configs.sh --zookeeper zookeeper:2181 --describe --entity-name test --entity-type topics

Configs for topic 'test' are    
```

### 5.3 删除topic的数据

```Java
./kafka-topics.sh --zookeeper zookeeper:2181 --alter --topic mytopic \
--config cleanup.policy=delete
```

### 5.4 配置文件全局策略

```Java
log.retention.hours=72
log.cleanup.policy=delete
```
