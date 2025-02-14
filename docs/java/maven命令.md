---
title: maven命令
tags:
  - java
createTime: 2025/02/14 15:59:05
permalink: /article/y8jwel8l/
---

## 1. maven加载本地jar包

```shell
mvn install:install-file "-Dfile=ojdbc7.jar" "-DgroupId=com.oracle" "-DartifactId=ojdbc7" "-Dversion=12.2.0.1" "-Dpackaging=jar"
```

## 2. maven打印依赖树

```shell
mvn dependency:tree
```
