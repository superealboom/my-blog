---
title: 泛型EnumUtil
tags:
  - java
createTime: 2025/02/14 15:59:54
permalink: /article/tedkhjpj/
---

```Java
class Person {
  private Integer gender;//1:男 0:女
}
```

现在拿到person对象要在前端页面显示出来，但是不能显示0或者1，要显示男或者女。嗯，可以写if else。但是若是这种“数字对应内容”的字段很多呢，每一个都写if else。那这里应该想想有没有好的解决方案了。

可以这样。

```Java
class Person {
  private Integer gender;//1:男 0:女

  //该注解是因为，
  //返回json数据的时候不会用到该方法
  @JsonIgnore
  public GenderEnum getGenderEnum() {
      return EnumUtil.getBycode(gender, GenderEnum.class);
  }
}
public class EnumUtil {

    public static <T extends CodeEnum> T getBycode(Integer code, Class<T> enumClass) {
        for (T each: enumClass.getEnumConstants()) {
            if (code.equals(each.getCode())) {
               return each;
            }
        }
        return null;
    }
}
public interface CodeEnum {
    Integer getCode();
}
@Getter
public enum GenderEnum implements CodeEnum {
    WOMAN(0,"女"),
    MAN(1,"男"),
    ;

    private Integer code;
    private String message;

    GenderEnum(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
```
