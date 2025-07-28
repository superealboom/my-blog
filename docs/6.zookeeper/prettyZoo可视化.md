---
title: prettyZoo可视化
tags:
  - zookeeper
  - 软件安装
createTime: 2025/03/20 10:43:13
permalink: /article/e99u59vw/
---

> docker 中安装好 zookeeper 后，继续安装可视化 zookeeper 工具

1. 选择 PrettyZoo !! 下载地址： [github release 地址](https://github.com/vran-dev/PrettyZoo/releases)

2. 下载 `prettyZoo-mac.dmg` 后正常打开提示，“PrettyZoo 已损坏，无法打开。 你应该将它移到废纸篓。” （忘记截图）
3. 打开 终端，输入 `sudo spctl --master-disable` 后回车
4. 在 隐私与安全性 中选择 任何来源，如果没有出现，就随便点个别的菜单再点回来

![image-20250320105033083](https://afuo-blog.oss-cn-beijing.aliyuncs.com/zookeeper.assets/image-20250320105033083.png)

5. 再次尝试是否能够打开 PrettyZoo，发现仍然打不开
6. 再次打开终端，输入 `xattr -cr` 再把应用程序中的PrettyZoo 拖入到终端中
7. 终端会显示 `xattr -cr /Applications/prettyZoo.app ` 再点回车

![image-20250320105527540](https://afuo-blog.oss-cn-beijing.aliyuncs.com/zookeeper.assets/image-20250320105527540.png)

8. 继续尝试打开 PrettyZoo，可以打开了!!

![image-20250320105802439](https://afuo-blog.oss-cn-beijing.aliyuncs.com/zookeeper.assets/image-20250320105802439.png)

9. 然后填入地址端口尝试连接，连接成功 !!

![image-20250320105915827](https://afuo-blog.oss-cn-beijing.aliyuncs.com/zookeeper.assets/image-20250320105915827.png)
