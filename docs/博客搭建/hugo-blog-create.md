---
title: hugo+vercel搭建博客
tags:
   - 环境搭建
createTime: 2025/02/11 10:23:20
permalink: /article/edguu59l/
---
## 询问deepseek建议

询问 deepseek 后推荐使用 <u>***hugo + vercel***</u> 快速上线

![image-20250208184642351](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208184642351.png)

## mac安装homebrew

使用科大镜像

1. 安装

   ```shell
   /bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"
   ```

2. 卸载

   ```shell
   /bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/uninstall.sh)"
   ```

安装成功截图：

![image-20250211124545638](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250211124545638.png)

## homebrew安装hugo

```shell
brew install hugo
```

![image-20250208161524587](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208161524587.png)

## hugo安装主题（FixIt）

```shell
hugo new site my-blog
cd my-blog
git init
git submodule add https://github.com/hugo-fixit/FixIt.git themes/FixIt
```

执行 `git submodule add https://github.com/hugo-fixit/FixIt.git themes/FixIt` 报错

![image-20250208162116637](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208162116637.png)

挂着梯子，导致本机系统端口号和 git 端口号不一致导致。

查看本机端口号，设置 git 端口号与本机一致即可。

![image-20250208162402782](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208162402782.png)

执行命令

```shell
git config --global http.proxy 127.0.0.1:7890
git config --global https.proxy 127.0.0.1:7890
```

再次 clone 仓库，继续报错。

![image-20250208162700486](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208162700486.png)

执行命令

```shell
git config --global http.version HTTP/1.1
```

继续 clone 仓库，成功。

## 配置hugo

```shell
echo "theme = 'FixIt'" >> hugo.toml
echo "defaultContentLanguage = 'zh-cn'" >> hugo.toml
# 启动 hugo，通过日志中链接可以本地访问了
hugo server
```

![image-20250208164124231](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208164124231.png)

打开my-blog下的hugo.toml，添加配置

```toml
[markup]
  _merge = "shallow"
[outputs]
  _merge = "shallow"
[taxonomies]
  _merge = "shallow"
```

## 写第一篇文章

```shell
hugo new content posts/BlogCreate.md
```

编辑器打开文件随便编写内容，将draft 改成 false

## 预览

```shell
hugo server --buildDrafts
hugo server -D
# 建议
hugo server -D --disableFastRender
```

## 编译发布

```shell
hugo
```

发布后在my-blog下会有 public 文件夹。

## 部署verlcel (现已被墙)

在github上创建一个同名仓库 my-blog

```shell
git remote add origin git@github.com:superealboom/my-blog.git
git push -u origin main
```

打开 [verlcel](https://vercel.com/) 网站，用github账号注册，并在导入项目页面添加账户 Add Github Account，再选择需要导入的项目。

![image-20250211124623120](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250211124623120.png)

之后再import project，点击最后的deploy等待，部署成功。

点击去dashborad，可以通过 https://my-blog-eight-indol.vercel.app/ 访问到了。

![image-20250208172248785](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208172248785.png)

## vercel国内域名映射

我之前在阿里云申请过域名，且备案通过了 `afuo.cn`

打开阿里云的域名控制台，点击管理再点击域名解析，记录映射到vercel里的`my-blog-eight-indol.vercel.app`

![image-20250208181805119](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208181805119.png)

![image-20250208182046077](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208182046077.png)

在 vercel 中在刚才添加的项目中增加自定义域名配置，www.afuo.cn 和 afuo.cn

![image-20250208182409482](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208182409482.png)

此时不挂梯子都不能访问，挂着梯子时

1.  [my-blog-eight-indol.vercel.app](https://my-blog-eight-indol.vercel.app/) (可以访问)
2.  [www.afuo.cn](https://www.afuo.cn/) （不能访问）
3.  [afuo.cn](https://afuo.cn/) （不能访问）

## vercel国内域名被墙解决办法

1. 在阿里云中记录值替换成`cname-china.vercel-dns.com` 替换后稍等一段时间

   挂着梯子时，3 个域名都能访问了，但国内域名访问太慢。

   不挂梯子时，vercel 的域名不能访问，国内两个域名都可以，速度自测还行。✅

2. 在使用vercel 的基础上再增加 ***CloudFlare*** 也可以解决被墙问题，但是引用组建太多了，暂时先不考虑这种方法。

3. 也可以替换vercel，既然 vervel 被墙，必然有其他可替换方法，使用**Netlify** or **Zeabur** 或者 deepseek 给出的其他方式。

![image-20250208185800211](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250208185800211.png)

## 结局

当我们访问 www.afuo.cn 或者 afuo.cn 时，可以访问到个人静态博客。

## Hugo 问题

我发现 hugo 中的每个 md 文章都会有一个叫做 frontmatter 的内容，即设置文章标题作者等信息，而这我认为对一个纯净 md 文章进行的侵入，如果后续迁移文章到其他平台，工作量太大。

![image-20250209155232085](https://afuo-blog.oss-cn-beijing.aliyuncs.com/hugo-blog-create.assets/image-20250209155232085.png)

而解决办法只有将 frontmatter 统一管理到一个 json/yaml 等这样文件中，需要维护此文件。

## 参考文献

[mac安装homebrew](https://developer.aliyun.com/article/1291277) ：阿里云攻略

[解决git问题](https://blog.csdn.net/qq_40296909/article/details/134285451) ：`Failed to connect to github.com port 443 after 75022 ms: Couldn't connect to server`

[解决git问题](https://blog.csdn.net/weixin_41886421/article/details/135417000) ：`RPC failed; curl 92 HTTP/2 stream 5 was not closed cleanly: CANCEL (err 8)`

[hugo主题fixit](https://fixit.lruihao.cn/zh-cn/) ：个人觉得一个好看的主题

[hugo官网站点](https://hugo.opendocs.io/zh-cn/getting-started/directory-structure/) ：有hugo各种介绍

[vervel 被墙解决](https://blog.csdn.net/j3T9Z7H/article/details/133003058) ：DNS 被污染









