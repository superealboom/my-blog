import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  { text: '首页', link: '/', icon: 'line-md:home' },
  { text: '博客', link: '/blog/', icon: 'mynaui:pencil' },
  {
    text: '开发',
    icon: 'hugeicons:computer-programming-02',
    items: [
      { text: '操作系统', link: '/notes/operatingSystem/README.md', icon: 'ix:operating-system' },
      { text: '计算机网络', link: '/notes/computerNetwork/README.md', icon: 'oui:ip' },
      { text: '数据结构与算法', link: '/notes/dataStructuresAndAlgorithms/README.md', icon: 'quill:sort' },
    ]
  },
 
])
