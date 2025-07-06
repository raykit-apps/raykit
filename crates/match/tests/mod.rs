use raykit_match::{Context, FileEntry, FileType, Match};

#[test]
fn match_serialization() {
    let match_obj = Match::with_lens("text == *", [1, 200]);
    let json = serde_json::to_string(&match_obj).unwrap();
    let deserialized: Match = serde_json::from_str(&json).unwrap();
    assert_eq!(match_obj, deserialized);
}

#[test]
fn test_context_based_text_matching() {
    let match_obj = Match::new("text == 'hello'");
    let context = Context::new().with_text("hello");
    assert_eq!(match_obj.matches(&context), true);

    let context = Context::new().with_text("world");
    assert_eq!(match_obj.matches(&context), false);
}

#[test]
fn test_context_based_files_matching() {
    let match_obj = Match::new("files == 'tsconfig.json'");

    let files = vec![
        FileEntry::new("/project/tsconfig.json", FileType::File),
        FileEntry::new("/project/package.json", FileType::File),
    ];
    let context = Context::new().with_files(files);
    assert_eq!(match_obj.matches(&context), true);

    let files = vec![FileEntry::new("/project/package.json", FileType::File)];
    let context = Context::new().with_files(files);
    assert_eq!(match_obj.matches(&context), false);
}

#[test]
fn test_full_path_matching() {
    let match_obj = Match::new("files = '/project/src'");

    let files = vec![
        FileEntry::new("/project/src/main.rs", FileType::File),
        FileEntry::new("/project/README.md", FileType::File),
    ];
    let context = Context::new().with_files(files);
    assert_eq!(match_obj.matches(&context), true);
}

#[test]
fn test_directory_matching() {
    let match_obj = Match::new("dirs == 'src'");

    let files = vec![
        FileEntry::new("/project/src", FileType::Directory),
        FileEntry::new("/project/tests", FileType::Directory),
        FileEntry::new("/project/main.rs", FileType::File),
    ];
    let context = Context::new().with_files(files);
    assert_eq!(match_obj.matches(&context), true);
}

#[test]
fn test_active_file_matching() {
    let match_obj = Match::new("activeFile = '.rs'");
    let context = Context::new().with_active_file("/project/src/main.rs");
    assert_eq!(match_obj.matches(&context), true);

    let context = Context::new().with_active_file("/project/package.json");
    assert_eq!(match_obj.matches(&context), false);
}

#[test]
fn test_file_extension_matching() {
    let match_obj = Match::new("fileExt == 'rs'");

    let files = vec![
        FileEntry::new("/project/src/main.rs", FileType::File),
        FileEntry::new("/project/lib.rs", FileType::File),
        FileEntry::new("/project/package.json", FileType::File),
    ];
    let context = Context::new().with_files(files);
    assert_eq!(match_obj.matches(&context), true);

    let files = vec![
        FileEntry::new("/project/package.json", FileType::File),
        FileEntry::new("/project/README.md", FileType::File),
    ];
    let context = Context::new().with_files(files);
    assert_eq!(match_obj.matches(&context), false);
}

#[test]
fn test_workspace_matching() {
    let match_obj = Match::new("workspace = 'project'");
    let context = Context::new().with_workspace("/home/user/my-project");
    assert_eq!(match_obj.matches(&context), true);

    let context = Context::new().with_workspace("/home/user/other");
    assert_eq!(match_obj.matches(&context), false);
}

#[test]
fn test_complex_context_matching() {
    let match_obj = Match::new("text == 'hello' && files == 'main.rs' && app == 'vscode'");

    let files = vec![
        FileEntry::new("/project/src/main.rs", FileType::File),
        FileEntry::new("/project/Cargo.toml", FileType::File),
    ];

    let context = Context::new()
        .with_text("hello")
        .with_files(files)
        .with_app("vscode", Some("My Project"));

    assert_eq!(match_obj.matches(&context), true);
}

#[test]
fn test_logical_operations_with_context() {
    let match_obj = Match::new("text == 'hello' || text == 'world'");

    let context = Context::new().with_text("hello");
    assert_eq!(match_obj.matches(&context), true);

    let context = Context::new().with_text("world");
    assert_eq!(match_obj.matches(&context), true);

    let context = Context::new().with_text("foo");
    assert_eq!(match_obj.matches(&context), false);
}

#[test]
fn test_mixed_file_and_directory_context() {
    let match_obj = Match::new("files == * && dirs == *");

    let entries = vec![
        FileEntry::new("/project/src", FileType::Directory),
        FileEntry::new("/project/tests", FileType::Directory),
        FileEntry::new("/project/main.rs", FileType::File),
        FileEntry::new("/project/lib.rs", FileType::File),
    ];

    let context = Context::new().with_files(entries);
    assert_eq!(match_obj.matches(&context), true);
}

#[test]
fn test_regex_matching_with_paths() {
    let match_obj = Match::new("files == /.*\\.rs$/");

    let files = vec![
        FileEntry::new("/project/src/main.rs", FileType::File),
        FileEntry::new("/project/lib.rs", FileType::File),
        FileEntry::new("/project/package.json", FileType::File),
    ];

    let context = Context::new().with_files(files);
    assert_eq!(match_obj.matches(&context), true);
}

#[test]
fn test_length_validation_with_context() {
    let match_obj = Match::with_lens("text == *", [1, 5]);

    let context = Context::new().with_text("hello");
    assert_eq!(match_obj.matches(&context), true);

    let context = Context::new().with_text("hi");
    assert_eq!(match_obj.matches(&context), true);

    let context = Context::new().with_text("this is too long");
    assert_eq!(match_obj.matches(&context), false);

    let context = Context::new().with_text("");
    assert_eq!(match_obj.matches(&context), false);
}

#[test]
fn test_large_file_list_performance() {
    let match_obj = Match::new("files = '.rs'");

    // 模拟大量文件和文件夹混合的场景
    let mut entries = Vec::new();
    for i in 0..1000 {
        entries.push(FileEntry::new(format!("/project/file{}.txt", i), FileType::File));
        entries.push(FileEntry::new(format!("/project/dir{}", i), FileType::Directory));
    }
    entries.push(FileEntry::new("/project/main.rs", FileType::File));

    let context = Context::new().with_files(entries);
    assert_eq!(match_obj.matches(&context), true);
}

// 向后兼容性测试
#[test]
fn test_backward_compatibility() {
    let match_obj = Match::with_lens("text == *", [1, 200]);
    assert_eq!(match_obj.validate_text("hello"), true);
    assert_eq!(match_obj.validate_text(""), false);

    assert_eq!(match_obj.validate_files(&vec!["hello.txt".to_string()]), true);
    assert_eq!(match_obj.validate_files(&vec![]), false);

    assert_eq!(match_obj.validate_app("vscode", Some("main")), true);
}

#[test]
fn test_file_entry_utilities() {
    let file = FileEntry::new("/project/src/main.rs", FileType::File);
    assert_eq!(file.name, "main.rs");
    assert_eq!(file.extension(), Some("rs".to_string()));
    assert_eq!(file.parent(), Some("/project/src".to_string()));
    assert!(file.is_file());
    assert!(!file.is_directory());

    let dir = FileEntry::new("/project/src", FileType::Directory);
    assert_eq!(dir.name, "src");
    assert_eq!(dir.extension(), None);
    assert!(dir.is_directory());
    assert!(!dir.is_file());
}

#[test]
fn test_context_file_filtering() {
    let entries = vec![
        FileEntry::new("/project/main.rs", FileType::File),
        FileEntry::new("/project/lib.rs", FileType::File),
        FileEntry::new("/project/src", FileType::Directory),
        FileEntry::new("/project/tests", FileType::Directory),
        FileEntry::new("/project/package.json", FileType::File),
    ];

    let context = Context::new().with_files(entries);

    assert_eq!(context.files().len(), 3);
    assert_eq!(context.directories().len(), 2);
    assert_eq!(context.files_with_extension("rs").len(), 2);
    assert_eq!(context.files_with_extension("json").len(), 1);
}

#[test]
fn debug_simple_text_matching() {
    // 测试最简单的文本匹配
    let match_obj = Match::new("text == 'hello'");
    let context = Context::new().with_text("hello");

    println!("Testing simple text match: {:?}", match_obj.match_expr);
    println!("Context text: {:?}", context.text);
    println!("Result: {}", match_obj.matches(&context));

    assert_eq!(match_obj.matches(&context), true);
}

#[test]
fn debug_wildcard_matching() {
    // 测试通配符匹配
    let match_obj = Match::new("text == *");
    let context = Context::new().with_text("hello");

    println!("Testing wildcard match: {:?}", match_obj.match_expr);
    println!("Context text: {:?}", context.text);
    println!("Result: {}", match_obj.matches(&context));

    assert_eq!(match_obj.matches(&context), true);
}

#[test]
fn debug_logical_operations() {
    // 测试逻辑或操作
    let match_obj = Match::new("text == 'hello' || text == 'world'");
    let context = Context::new().with_text("hello");

    println!("Testing logical OR: {:?}", match_obj.match_expr);
    println!("Context text: {:?}", context.text);

    // 手动测试解析
    if let Ok(expr) = match_obj.parse() {
        println!("Parsed expression: {:?}", expr);
    } else {
        println!("Failed to parse expression");
    }

    println!("Result: {}", match_obj.matches(&context));
}
