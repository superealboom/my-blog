---
title: vuePress-Plume搭建博客
tags:
  - 环境搭建
createTime: 2025/02/11 19:31:50
permalink: /article/4yuk67m5/
---
## 前情提要

使用 vuePress 主题 Plume 代替 hugo 搭建静态博客。

因为后续想将所学知识运用到 Vue3 + Springcloud 上，所以这里直接使用 vuePress 去掉 hugo，熟悉 vue3.0。

同时 vuePress 生态查询问题解决问题比 hugo 生态更加成熟。

## 安装环境

![image-20250211180806017](https://afuo-blog.oss-cn-beijing.aliyuncs.com/vuePress-Plume.assets/image-20250211180806017.png)

### 1 安装node

本地之前安装过 nvm 和 node，但是 node 版本太低，现在安装最新版本 node，同时旧版本 node 没用了直接卸载。

```shell
nvm uninstall v16.16.0 
```

再列举所有可用版本。

```shell
nvm ls-remote
```

尝试列举后报错: `N/A`

执行下面命令解决。

```shell
export NVM_NODEJS_ORG_MIRROR=http://nodejs.org/dist
```

再安装最新版本。

```shell
nvm install v23.7.0
```

若电脑上还有其他 node 版本，想切换默认版本，也可以执行。

```shell
nvm alias default v23.7.0
```

### 2 安装yarn

使用 brew 安装 yarn，`brew install yarn` 安装得到 ` yarn: stable 1.22.22 (bottled)` ，并不是最新版，所以再卸载掉，尝试通过其他方式安装 yarn。

通过网上资料得知：Node.js 从大概版本 14 开始加入了实验性的`corepack`用于管理诸如 `yarn` 和 `pnpm` 这样的第三方包管理器。

```shell
# 开启corepack
corepack enable
# 使用corepack安装 yarn，执行版本
corepack install --global yarn@4.6.0
```

`yarn -v` 后得知现在版本已经是最新版。

### 3 安装pnpm

已经好yarn了，但是主题推荐使用pnpm，所以索性直接安装好了pnpm。

继续执行 pnpm -v ，提示如下

```shell
! Corepack is about to download https://registry.npmjs.org/pnpm/-/pnpm-10.2.1.tgz                                                                                                       
? Do you want to continue? [Y/n] y    
```

输入 y 后安装成功，环境大功告成。

## 使用plume

环境安装好之后

剩下的操作按照教学文档来做就行，很顺利。文档放在参考文献中了。

![image-20250211193446833](https://afuo-blog.oss-cn-beijing.aliyuncs.com/vuePress-Plume.assets/image-20250211193446833.png)

## 部署plume

因为之前有过hugo部署在vercel的经验，所以还是直接将plume部署在vercel上，具体选项文档中有写。

![image-20250211184451311](https://afuo-blog.oss-cn-beijing.aliyuncs.com/vuePress-Plume.assets/image-20250211184451311.png)

按照之前 hugo+vercel 的经验，同样绑定域名即可。

浏览器输入 afuo.cn 或者 www.afuo.cn 可以访问。

## 图片上传方案

这个事情纠结了很久。

方案 1：typora 的相对路径存放文件。随着博客内容写多了不易管理，图片一多，打包占用空间也大。

方案 2：typora + PicGo图床工具 + 阿里云/腾讯云。这种我之前用过，有个问题是图床工具只有设置一个存储路径，比如我的博客中每个文章里的图片要分开放，便于日后查看管理，图床就很难做到。

方案 3：typora + 阿里云。typora 想把文件放在文件名同名的图片文件夹中，当文章写完确认没问题后，将文件夹上传到阿里云，再统一将相对路径全局替换成绝对路径。

![image-20250211194648933](https://afuo-blog.oss-cn-beijing.aliyuncs.com/vuePress-Plume.assets/image-20250211194648933.png)

最终还是选择方案 3。

## 后续优化

### 1 样式优化

更换标题、logo、图标、域名备案号、更换首页显示内容、增加本地图标资源、修改联系方式 ...

```shell
增加本地图标资源
pnpm add @iconify/json
```

### 2 代理优化

在家连WiFi发现上不了博客，但是用流量可以，用测速网站试了下，发现北京联通被断了，所以寻求加速方案。

在阿里云的 DNS 解析中将`cname-china.vercel-dns.com` 换成 `vercel.cdn.yt-blog.top` 可解决。

## 参考文献

[yarn 版本](https://github.com/yarnpkg/berry) ：github地址，可查看yarn的最新稳定版。

[plume文档](https://theme-plume.vuejs.press/guide/intro/) : 文档很详细，给大佬一个赞👍。

[vercel 加速](https://www.yt-blog.top/9952/): vercel 加速节点。

[测速网站](https://zhale.me/http/) : 炸了么。

[iconify 图标](https://icon-sets.iconify.design/) : plume 指定图标库。

[生成 svg](https://realfavicongenerator.net/)：上传图标，制作 svg。
