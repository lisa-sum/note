# Yarn

#PackageManage #命令

## ָ��

### yarn global

> ȫ�ְ�װ �κεط�������ʹ��

```
yarn global add <package...>
```

### yarn add

> ��װһ�����������������κΰ�

+ ```sh
  //���°汾
  yarn add <package...>
  ```

+ ```
  //ָ���汾��
  yarn add <package...>@[version] 
  ```

+ ```
  //ָ���汾��ǩ
  yarn add <package...>@[tag]
  ```

+ ```
  //������������
  yarn add <package...> --dev
  yarn add <package...> -D
  ```

+ ```
  //peer ͬ�л�������
  yarn add <package...> --peer
  ```

### yarn install

> ��װ�����ļ������г�������������:
>
> + package.json
> + node_modules
>
> �������,���������������г�������,��װ�м�¼��ȷ�а汾,���ұ��ֲ���.�������°汾
>
> ���������,���������������г�������(����: �ֶ���package.json�������� ),yarn��Ѱ��Լ�������°汾.���д��
>
> + yarn.lock
> + package.json

```
yarn install
```

#### �����汾

> ȷ��������

```
yarn.lock --frozen-lockfile
```

#### `--flat`

> ��װ����������,��ÿ��������ֻ������װһ���汾,�ڵ�һ������ʱ���⽫��ʾ��Ϊ�ڶ���汾��Χ�������ڵ�ÿ����ѡ�񵥸��汾����Щ�������ӵ������ֶ���
>
> + package.json
> + resolutions

```json
"resolutions": {
  "package-a": "2.0.0",
  "package-b": "5.0.0",
  "package-c": "1.5.2"
}
```

#### `--har`

> �Ӱ�װ�ڼ�ִ�е������������������[HTTP �浵](https://en.wikipedia.org/wiki/.har)��HAR
> �ļ�ͨ�����ڵ����������ܣ����ҿ���ʹ��[Google �� HAR ������](https://toolbox.googleapps.com/apps/har_analyzer/)��
> HAR[�鿴��](http://www.softwareishard.com/blog/har-viewer/)�ȹ��߽��з�����

```
yarn install --har
```

#### `--no-lockfile`

> ��Ҫ��ȡ`yarn.lock`��`yarn.lock`�������ļ���

```
yarn install --no-lockfile
```

##### `--pure-lockfile`

> ������`yarn.lock`�����汾�ļ���

```
yarn install --pure-lockfile
```

### yarn remove

> ���н�ɾ��������ֱ�������������İ������������ļ��Ĺ���

> ɾ��ĳ�����µ����л���,����Ҫ������

```
yarn remove <package...>
```

### yarn init

> ��������Ŀ ����Ĭ�ϵ�package.json

```
yarn init
```

### yarn up

> ��������

```
//���������°汾
yarn up <package>
```

```
//������ָ���汾��
yarn up <package>@[version]
```

```
//����������ָ����ǩ
yarn up <package>@[tag]
```

### yarn set

> ����yarn����

+ ```yaml
  yarn set version latest
  yarn set version from sources(��Դ)
  ```

## ����

> ��ѡ�Ĳ���,�ڰ�װ������ʱ����β�����Ӳ���

### ``-dev`` / ``-D ``

> ʹ�û�Ҫ��װһ�������������[`��������`](https://classic.yarnpkg.com/en/docs/dependency-types#toc-dev-dependencies)

```
yarn add package-name -D
```

```
yarn add package-name -dev
```

#### ��``npm`` ��``--save-dev``�ȼ�

```
npm install package-name --save-dev
```

### ``@npm:``

> ���������ñ���

```
// �﷨
yarn add <alias-package>@npm:<package>
```

+ ```
  yarn add elementplus@npm:vite-plugin-element-plus -dev
  ```

+ ```
  yarn add elementplus@npm:vite-plugin-element-plus@1.2.3 -dev
  ```

+ ```
  yarn add elementplus@npm:vite-plugin-element-plus@next -D
  ```

### ``--audit``

> ����Ѱ�װ�İ�����֪�İ�ȫ����.
>
> ����ѷ��ֵ��������

```
//�﷨
yarn add <package...> --audit
```

```
yarn audit
```

### ``--peer`` /  ``-P``

> ʹ�û�Ҫ��װһ�������������[`ͬ������`](https://classic.yarnpkg.com/en/docs/dependency-types#toc-peer-dependencies)

```
yarn add package-name --peer
```

```
yarn add package-name -P
```

### ``--optional``  / ``-O``

> ʹ�û�Ҫ��װһ��������������[`��ѡ������`](https://classic.yarnpkg.com/en/docs/dependency-types#toc-optional-dependencies)

```
yarn add package-name --optional
```

```
yarn add package-name -O
```

### ``--exact/-E``

```
yarn add <package...> --exact
```

```
yarn add <package...> -D
```

### ָ���汾��

#### ��װ���°汾�İ�

> �����κβ���

```
yarn add package-name 
```

#### ��װ�ض��汾��

> ``@``���Ű汾��

```
yarn add pageage-name @1.2.3 
```

#### ��װ�ض���ǩ�İ�

> ``@``���ű�ǩ��
>
> ����
>
> + beta
> + next
> + latest

```
yarn add pageage-name @next
```

#### ָ����ͬλ�õİ�

##### ��peckage.jsonָ���İ�

##### ��װ���صİ�

> �����Ԥ����ʱ��ʹ��

```
yarn add file:/path/to/lcoal/folder
```

##### ��װGitԶ�̵İ�

> ��Զ�� git �洢�ⰲװ����

```
yarn add <git remote url>
```

##### ��װ�ض� git ��֧��git �ύ�� git ��ǩ�ϴ�Զ�� git �洢�ⰲװ����

```
yarn add <git remote url>#<branch/commit/tag>
```

## ��������

#### `dependencies`

> ������������ϵ,���д������������. Ҳ����������
>
> ����:
>
> + vue
> + vue-router
> + vuex

```json
 "dependencies": {
    "package-a": "^1.0.0"
  },
```

#### ``devDependencies``

> ����ʱ������,���д���ʱ����Ҫ��������
>
> ����:
>
> + Banel
> + Flow
> + webpack
> + vite

#### `peerDependencies`

> ͬ��������һ��������������ͣ�ֻ�����������Լ��İ�ʱ�Ż���֡�
>
> ӵ��ͬ٭������ζ�����İ���Ҫ�밲װ���İ�������ȫ���������ڴ�����Ҫ��װ����������ԱҲʹ�õ��������İ���������á�`react``react-dom`

#### `optionalDependencies`

> ��ѡ������ֻ�ǣ���ѡ��������ǲ��ܰ�װ��Yarn ��Ȼ��˵��װ�����ǳɹ��ġ�
>
> ����ڲ�һ��������ÿ̨�����������Ժ����ã���������һ�����˼ƻ����Է�����δ��װ�����磬�����ˣ�ͬ٭������һ��������������ͣ�ֻ�����������Լ��İ�ʱ�Ż���֡�

#### `bundledDependencies`

> ������ʱ������İ�������
>
> ��������Ӧ��������Ŀ�С����������������Ի�����ͬ���ܲ�ʱҲ�ἷ�����ˡ�yarn pack
>
> ��������ͨ����װ�� npm ע����С��������������������£��������������õģ�
>
> ������Ҫ���ò����� npm ע��������޸ĵĵ�������ʱ��
> ������Ҫ���Լ�����Ŀ��������ģ��ʱ��
> ������Ҫ��ģ���зַ�ĳЩ�ļ�ʱ��