import { defineNotesConfig } from 'vuepress-theme-plume'
import operatingSystem from './operatingSystem'
import computerNetwork from './computerNetwork'
import dataStructuresAndAlgorithms from './dataStructuresAndAlgorithms'
import designPattern from './designPattern'

export default defineNotesConfig({
    // 声明所有笔记的目录，(默认配置，通常您不需要声明它)
    dir: '/notes/',
    link: '/',
    // 在这里添加 note 配置
    notes: [
        operatingSystem,
        computerNetwork,
        dataStructuresAndAlgorithms,
        designPattern,
    ]
})
