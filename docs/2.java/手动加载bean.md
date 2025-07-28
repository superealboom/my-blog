---
title: 手动加载bean
tags:
  - java
createTime: 2025/02/14 16:00:59
permalink: /article/7eye2aol/
---

## 1 报错

```java
org.springframework.beans.BeanInstantiationException: 
Failed to instantiate []: 
Constructor threw exception; 
nested exception is java.lang.NullPointerException
```

## 2 场景

### 1 实现ApplicationContextAware类

```Java
@Component
public class ApplicationContextHelper implements ApplicationContextAware {

    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        if (ApplicationContextHelper.applicationContext == null) {
            ApplicationContextHelper.applicationContext = applicationContext;
        }
    }

    public static ApplicationContext getApplicationContext(){
        return applicationContext;
    }

    public static <T> T getBean(Class<T> clazz) {
        return (T) getApplicationContext().getBean(clazz);
    }
}
```

### 2 使用ApplicationContextHelper手动注入

```Java
@Component
public class InternalJson {
    private ZookeeperHelper zookeeperHelper = ApplicationContextHelper.getBean(ZookeeperHelper.class);

        // other code...
}
```

## 3 原因

Springboot启动时先加载InternalJson，此时ApplicationContextHelper类的setApplicationContext还未加载，导致applicationContext空指针。

## 4 解决办法

规定InternalJson和ApplicationContextHelper的加载顺序，使用DependsOn注解

### 1 ApplicationContextHelper改动

```Java
// 增加注解名
@Component("ApplicationContextHelper")
public class ApplicationContextHelper implements ApplicationContextAware {
 // ... 
}
```

### 2 InternalJson改动

```Java
@Component
// 增加DependsOn注解
@DependsOn("ApplicationContextHelper")
public class InternalJson {
    private ZookeeperHelper zookeeperHelper = ApplicationContextHelper.getBean(ZookeeperHelper.class);

        // other code...
}
```
