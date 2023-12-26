1. https://developer.aliyun.com/mirror/maven?spm=a2c6h.13651102.0.0.1fa71b11j9clgk
2. https://blog.csdn.net/qq_57474766/article/details/132644097 (可能已经过时)


示例1: 
```kts
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")  
pluginManagement {  
repositories {  
maven { url = uri("https://maven.aliyun.com/repository/public/") }  
maven { url = uri("https://maven.aliyun.com/repositories/jcenter") }  
maven { url = uri("https://maven.aliyun.com/repositories/google") }  
maven { url = uri("https://maven.aliyun.com/repositories/central") }  
google()  
gradlePluginPortal()  
mavenCentral()  
}  
}  
  
dependencyResolutionManagement {  
repositories {  
maven { url = uri("https://maven.aliyun.com/repository/public/") }  
maven { url = uri("https://maven.aliyun.com/repositories/jcenter") }  
maven { url = uri("https://maven.aliyun.com/repositories/google") }  
maven { url = uri("https://maven.aliyun.com/repositories/central") }  
google()  
mavenCentral()  
}  
}  
  
rootProject.name = "MyApplication1"  
include(":androidApp")  
include(":shared")
```

示例2: 
```kts
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")  
pluginManagement {  
repositories {  
maven { setUrl("https://maven.aliyun.com/repository/central") }
        maven { setUrl("https://maven.aliyun.com/repository/jcenter") }
        maven { setUrl("https://maven.aliyun.com/repository/google") }
        maven { setUrl("https://maven.aliyun.com/repository/gradle-plugin") }
        maven { setUrl("https://maven.aliyun.com/repository/public") }
        maven { setUrl("https://jitpack.io") }
google()  
gradlePluginPortal()  
mavenCentral()  
}  
}  
  
dependencyResolutionManagement {  
repositories {  
 // 改为阿里云的镜像地址
        maven { setUrl("https://maven.aliyun.com/repository/central") }
        maven { setUrl("https://maven.aliyun.com/repository/jcenter") }
        maven { setUrl("https://maven.aliyun.com/repository/google") }
        maven { setUrl("https://maven.aliyun.com/repository/gradle-plugin") }
        maven { setUrl("https://maven.aliyun.com/repository/public") }
        maven { setUrl("https://jitpack.io") }
————————————————
版权声明：本文为CSDN博主「Ahnkkk」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/weixin_47879762/article/details/132979766
google()  
mavenCentral()  
}  
}  
  
rootProject.name = "MyApplication1"  
include(":androidApp")  
include(":shared")
```