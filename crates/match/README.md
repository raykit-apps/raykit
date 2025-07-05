# match

## 语法

Match 结构支持序列化，可以使用serde_json序列化

下面这个json可以序列化

```json
{
  "match": "text == *",
  "lens": [1, 200]
}
```

匹配需要上述两个条件合并在一起
序列化后，会生成一个结构体并且有校验函数
有多个校验函数，有校验字符串的，多个文件名称的，还有运行窗口的(字符串的形式)

### Match支持的语法

1. 匹配任意字符: `"text == *"`
2. 匹配多个字符: `"text == 'bing' || text = 'google'"`, 字符串中必须出现完整的`bing`或者`google`才能匹配上
3. 正则匹配多个字符: `text == \^https\`
4. 正则匹配排除字符: `text != \^https\`
5. 复杂匹配多个字符: `"(text == 'bing' && text = 'google') || text != 'baidu'"`
6. 匹配任意文件(夹): `"files == *"`
7. 匹配特定名称文件: `"files" == tscongfig.json`
8. 其它匹配文件(夹)规则同匹配字符，文件夹用dir表示
9. 匹配应用窗口: `"app == xxx.exe | xxx.app && appTitle == 'vscode'"`

### Match支持的逻辑运算符

1. `&&` And
2. `||` Or
3. `!` Not

### 示例

需要序列化的json

```json
{
  "name": "name",
  "when": {
    "match": "text == *",
    "lens": [1, 200]
  }
}
```

对应的rust结构体

```rust

pub struct User {
  pub name: String,
  pub when: Match
}

```
