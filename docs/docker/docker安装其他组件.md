---
title: docker安装其他组件
tags:
  - docker
createTime: 2025/02/13 21:30:41
permalink: /article/tx8uktw9/
---
## tomcat
1. 在`https://hub.docker.com/` 上找到适合的tomcat版本
2. 然后拉取`docker pull tomcat:9.0.58-jdk8`
3. 简单启动(不映射任何容器中的文件到主机中)`docker run --name tomcat -p 8080:8080 -d tomcat`
4. 注意最新版的tomcat可能没有webapps，而是webapps.dist，需要改下名字
```shell
docker exec -it tomcat bash
# 进入webapps目录下
mv webapps.dist webapps
```
## zookeeper
```shell
docker pull zookeeper
docker run -d --name zookeeper -p 2181:2181 -t zookeeper:3.5.8
```
## kafka
```shell
docker pull wurstmeister/kafka:2.12-2.3.1
docker run  -d --name kafka -p 9092:9092 -e KAFKA_BROKER_ID=0 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092  wurstmeister/kafka:2.12-2.3.1
```
## mysql
```shell
# 查看mysql版本
docker search mysql

# 拉取mysql-server
docker pull mysql/mysql-server

# 运行mysql容器
docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql/mysql-server --lower-case-table-names=1

# 进入
docker exec -it mysql bash

mysql -u root -p
# 输入密码 root

# 授权、刷新授权、修改root密码、刷新授权
CREATE USER 'root'@'%' IDENTIFIED BY 'root';
# 更新密码
ALTER USER 'root'@'%' IDENTIFIED BY 'D~INMM9HB)5Da!x';
ALTER USER 'root'@'localhost' IDENTIFIED BY 'D~INMM9HB)5Da!x';
GRANT ALL ON *.* TO 'root'@'%';
flush privileges;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'D~INMM9HB)5Da!x';
flush privileges;
# 可以连接了

# 查看版本号
select version();
```
## postgres
```shell
docker search postgres
docker pull postgres
docker run --name postgres -e POSTGRES_PASSWORD=123456 -p 5432:5432 -d postgres
```
## redis
```shell
docker pull redis:latest
docker run -itd --name redis -p 6379:6379 redis  --requirepass 123456@
docker exec -it redis bash
```
## docker-compose.yml 安装zookeeper和kafka
```yaml
version: '3'
services:
  zk1:
    image: zookeeper:3.5.8
    ports:
      - "2181:2181"
    hostname: zk1
    container_name: zookeeper
  kafka:
    image: wurstmeister/kafka:2.12-2.3.1
    depends_on:
      - zk1
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: localhost
      KAFKA_CREATE_TOPICS: "test:1:1"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zk1:2181
    volumes:
      - /Users/tianci/DockerFile/zkAndKafka/docker.sock:/var/run/docker.sock
    container_name: kafka
```
```shell
# 服务打包
docker-compose build
# 服务启动
docker-compose up -d
```
## consul
```shell
docker search consul
docker pull consul
docker run -d -p 8500:8500 --name=consul consul agent -server -node=consul -bootstrap -ui -client='0.0.0.0'
```
## nacos
```shell
docker pull nacos/nacos-server:v2.1.1-slim
docker run --env MODE=standalone --name nacos -d -p 8848:8848 -p 9848:9848 nacos/nacos-server:v2.1.1-slim
```
## nginx
```shell
docker run --name nginx -v /opt/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -p 80:80 -d nginx
```




