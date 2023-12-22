[官方文档](https://typicode.github.io/husky/guide.html#custom-directory)

您可能遇到的另一种情况是文件 `package.json` 和 `.git` 目录不在同一级别。例如， `project/.git` 和 `project/front/package.json` .

解决方案:

package.json
```json
{
  "scripts": {
    "prepare": "cd .. && husky install front/.husky"
  }
}
```