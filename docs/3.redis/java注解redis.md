---
title: java注解redis
tags:
  - redis
createTime: 2025/02/14 15:24:11
permalink: /article/hlx8va7y/
---
缓存我是写在service里了，
有两个方法，
一个是通过商品ID查询方法，一个是通过商品ID和其他商品信息的更新方法。
有三个注解，
@Cacheable:将返回对象加入缓存
@CachePur:更新redis中的缓存对象
@CacheEvict:删除redis中的缓存对象
代码如下

```Java
@Override
@Cacheable(cacheNames = "product", key = "#productId")
public ProductInfo selectByProductId(Integer productId) {
    return productInfoMapper.selectByProductId(productId);
}

@Override
@CachePut(cacheNames = "product", key = "#productId", condition = "#productId > 0")
//@CacheEvict(cacheNames = "product", key = "123")
public ProductInfo updateByProductId(Integer productId) {
    productInfoMapper.updateByProductId(productId, KeyUtil.genUniqueKey());
    return productInfoMapper.selectByProductId(productId);
}
```


记得在启动类上加上@EnableCaching注解

```Java
@SpringBootApplication
@MapperScan(basePackages = "com.tianci.supereal.mapper")
@EnableCaching
public class SuperealApplication {
    public static void main(String[] args) {
        SpringApplication.run(SuperealApplication.class, args);
    }
}
```


还有pom.xml文件

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <version>RELEASE</version>
</dependency>
```
