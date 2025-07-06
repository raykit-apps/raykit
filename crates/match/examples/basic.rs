use raykit_match::Match;

fn main() {
    println!("=== raykit-match 使用示例 ===\n");

    // 示例1: 基本文本匹配
    println!("1. 基本文本匹配:");
    let match1 = Match::new("text == 'hello'");
    println!("  匹配表达式: text == 'hello'");
    println!("  测试 'hello': {}", match1.validate_text("hello"));
    println!("  测试 'world': {}", match1.validate_text("world"));
    println!();

    // 示例2: 通配符匹配
    println!("2. 通配符匹配:");
    let match2 = Match::new("text == *");
    println!("  匹配表达式: text == *");
    println!("  测试 'anything': {}", match2.validate_text("anything"));
    println!("  测试 '': {}", match2.validate_text(""));
    println!();

    // 示例3: 逻辑操作
    println!("3. 逻辑操作:");
    let match3 = Match::new("text == 'hello' || text == 'world'");
    println!("  匹配表达式: text == 'hello' || text == 'world'");
    println!("  测试 'hello': {}", match3.validate_text("hello"));
    println!("  测试 'world': {}", match3.validate_text("world"));
    println!("  测试 'foo': {}", match3.validate_text("foo"));
    println!();

    // 示例4: 带长度限制的匹配
    println!("4. 带长度限制的匹配:");
    let match4 = Match::with_lens("text == *", [1, 10]);
    println!("  匹配表达式: text == * (长度限制: 1-10)");
    println!("  测试 'hello': {}", match4.validate_text("hello"));
    println!("  测试 'hi': {}", match4.validate_text("hi"));
    println!(
        "  测试超长文本: {}",
        match4.validate_text("this is a very long text that exceeds the limit")
    );
    println!("  测试空字符串: {}", match4.validate_text(""));
    println!();

    // 示例5: 文件匹配
    println!("5. 文件匹配:");
    let match5 = Match::new("files == tsconfig.json");
    println!("  匹配表达式: files == tsconfig.json");
    let files1 = vec!["tsconfig.json".to_string(), "package.json".to_string()];
    let files2 = vec!["package.json".to_string(), "webpack.config.js".to_string()];
    println!("  测试 {:?}: {}", files1, match5.validate_files(&files1));
    println!("  测试 {:?}: {}", files2, match5.validate_files(&files2));
    println!();

    // 示例6: 应用窗口匹配
    println!("6. 应用窗口匹配:");
    let match6 = Match::new("app == 'vscode' && appTitle == 'main'");
    println!("  匹配表达式: app == 'vscode' && appTitle == 'main'");
    println!("  测试 vscode + main: {}", match6.validate_app("vscode", Some("main")));
    println!(
        "  测试 vscode + other: {}",
        match6.validate_app("vscode", Some("other"))
    );
    println!("  测试 chrome + main: {}", match6.validate_app("chrome", Some("main")));
    println!();

    // 示例7: 正则表达式匹配
    println!("7. 正则表达式匹配:");
    let match7 = Match::new("text == \\^https");
    println!("  匹配表达式: text == \\^https");
    println!(
        "  测试 'https://example.com': {}",
        match7.validate_text("https://example.com")
    );
    println!(
        "  测试 'http://example.com': {}",
        match7.validate_text("http://example.com")
    );
    println!();

    // 示例8: 复杂的逻辑表达式
    println!("8. 复杂的逻辑表达式:");
    let match8 = Match::new("(text == 'hello' && text = 'world') || text != 'foo'");
    println!("  匹配表达式: (text == 'hello' && text = 'world') || text != 'foo'");
    println!("  测试 'hello world': {}", match8.validate_text("hello world"));
    println!("  测试 'bar': {}", match8.validate_text("bar"));
    println!("  测试 'foo': {}", match8.validate_text("foo"));
    println!();

    // 示例9: JSON 序列化和反序列化
    println!("9. JSON 序列化和反序列化:");
    let match9 = Match::with_lens("text == 'hello'", [1, 100]);
    let json = serde_json::to_string_pretty(&match9).unwrap();
    println!("  原始对象: {:?}", match9);
    println!("  JSON 序列化:\n{}", json);
    let deserialized: Match = serde_json::from_str(&json).unwrap();
    println!("  反序列化后: {:?}", deserialized);
    println!("  相等性检查: {}", match9 == deserialized);

    println!("\n=== 示例完成 ===");
}
