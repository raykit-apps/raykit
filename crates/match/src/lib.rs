use regex::Regex;
use serde::{Deserialize, Serialize};
use std::path::Path;
use thiserror::Error;

/// 匹配结构体，支持动态表达式匹配
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Match {
    #[serde(rename = "match")]
    pub match_expr: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lens: Option<[u32; 2]>,
}

/// 文件系统条目类型
#[derive(Debug, Clone, PartialEq)]
pub enum FileType {
    File,
    Directory,
}

/// 文件系统条目
#[derive(Debug, Clone, PartialEq)]
pub struct FileEntry {
    /// 完整路径
    pub path: String,
    /// 文件类型
    pub file_type: FileType,
    /// 文件名（不含路径）
    pub name: String,
}

impl FileEntry {
    pub fn new<P: AsRef<Path>>(path: P, file_type: FileType) -> Self {
        let path_str = path.as_ref().to_string_lossy().to_string();
        let name = path
            .as_ref()
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        Self {
            path: path_str,
            file_type,
            name,
        }
    }

    pub fn is_file(&self) -> bool {
        matches!(self.file_type, FileType::File)
    }

    pub fn is_directory(&self) -> bool {
        matches!(self.file_type, FileType::Directory)
    }

    /// 获取文件扩展名
    pub fn extension(&self) -> Option<String> {
        Path::new(&self.path)
            .extension()
            .map(|ext| ext.to_string_lossy().to_string())
    }

    /// 获取父目录路径
    pub fn parent(&self) -> Option<String> {
        Path::new(&self.path)
            .parent()
            .map(|parent| parent.to_string_lossy().to_string())
    }
}

/// 动态匹配上下文，包含所有可能的匹配数据
#[derive(Debug, Clone, Default)]
pub struct Context {
    /// 当前选中的文本
    pub text: Option<String>,

    /// 所有文件和文件夹（混合在一起，完整路径）
    pub file_entries: Vec<FileEntry>,

    /// 当前活动文件的完整路径
    pub active_file: Option<String>,

    /// 当前应用名称
    pub app_name: Option<String>,

    /// 当前应用窗口标题
    pub app_title: Option<String>,

    /// 当前工作目录
    pub workspace: Option<String>,

    /// 自定义数据（用于扩展）
    pub custom: std::collections::HashMap<String, String>,
}

impl Context {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_text<S: Into<String>>(mut self, text: S) -> Self {
        self.text = Some(text.into());
        self
    }

    pub fn with_files<I>(mut self, files: I) -> Self
    where
        I: IntoIterator<Item = FileEntry>,
    {
        self.file_entries = files.into_iter().collect();
        self
    }

    pub fn with_active_file<S: Into<String>>(mut self, file: S) -> Self {
        self.active_file = Some(file.into());
        self
    }

    pub fn with_app<S: Into<String>>(mut self, name: S, title: Option<S>) -> Self {
        self.app_name = Some(name.into());
        self.app_title = title.map(|t| t.into());
        self
    }

    pub fn with_workspace<S: Into<String>>(mut self, workspace: S) -> Self {
        self.workspace = Some(workspace.into());
        self
    }

    /// 获取所有文件（过滤掉文件夹）
    pub fn files(&self) -> Vec<&FileEntry> {
        self.file_entries.iter().filter(|e| e.is_file()).collect()
    }

    /// 获取所有文件夹
    pub fn directories(&self) -> Vec<&FileEntry> {
        self.file_entries.iter().filter(|e| e.is_directory()).collect()
    }

    /// 按扩展名过滤文件
    pub fn files_with_extension(&self, ext: &str) -> Vec<&FileEntry> {
        self.files()
            .into_iter()
            .filter(|f| f.extension().as_deref() == Some(ext))
            .collect()
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum MatchType {
    Text,       // 匹配文本内容
    Files,      // 匹配文件路径/名称
    Dirs,       // 匹配文件夹路径/名称
    ActiveFile, // 匹配当前活动文件
    App,        // 匹配应用名称
    AppTitle,   // 匹配应用标题
    Workspace,  // 匹配工作目录
    FileExt,    // 匹配文件扩展名
}

#[derive(Debug, Clone, PartialEq)]
pub enum Operator {
    Equals,      // ==
    NotEquals,   // !=
    Contains,    // =
    NotContains, // !=
    Regex,       // /pattern/ 或 \pattern
    NotRegex,    // 否定的正则
    Any,         // *
}

#[derive(Debug, Clone, PartialEq)]
pub enum LogicalOp {
    And, // &&
    Or,  // ||
    Not, // !
}

#[derive(Debug, Clone, PartialEq)]
pub enum Expression {
    Simple {
        match_type: MatchType,
        operator: Operator,
        value: String,
    },
    Logical {
        left: Box<Expression>,
        op: LogicalOp,
        right: Box<Expression>,
    },
    Not(Box<Expression>),
    Parentheses(Box<Expression>),
}

#[derive(Debug, Error)]
pub enum MatchError {
    #[error("Invalid match expression: {0}")]
    InvalidExpression(String),
    #[error("Parse error: {0}")]
    ParseError(String),
    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),
    #[error("Length check failed: expected {expected:?}, got {actual}")]
    LengthError { expected: [u32; 2], actual: usize },
}

type Result<T> = std::result::Result<T, MatchError>;

impl Match {
    /// 创建新的匹配对象，使用默认长度范围
    pub fn new<S: Into<String>>(match_expr: S) -> Self {
        Self {
            match_expr: match_expr.into(),
            lens: Some([0, u32::MAX]),
        }
    }

    /// 创建带自定义长度范围的匹配对象
    pub fn with_lens<S: Into<String>>(match_expr: S, lens: [u32; 2]) -> Self {
        Self {
            match_expr: match_expr.into(),
            lens: Some(lens),
        }
    }

    /// 核心匹配方法 - 检查给定的上下文是否满足匹配条件
    pub fn matches(&self, context: &Context) -> bool {
        match self.parse() {
            Ok(expr) => self.evaluate_expression(&expr, context).unwrap_or(false),
            Err(_) => false,
        }
    }

    /// 解析匹配表达式
    pub fn parse(&self) -> Result<Expression> {
        Parser::new(&self.match_expr).parse()
    }

    /// 评估表达式
    fn evaluate_expression(&self, expr: &Expression, context: &Context) -> Result<bool> {
        match expr {
            Expression::Simple {
                match_type,
                operator,
                value,
            } => self.evaluate_simple(match_type, operator, value, context),
            Expression::Logical { left, op, right } => {
                let left_result = self.evaluate_expression(left, context)?;
                match op {
                    LogicalOp::And => {
                        // 短路求值：如果左边为false，直接返回false
                        if !left_result {
                            return Ok(false);
                        }
                        let right_result = self.evaluate_expression(right, context)?;
                        Ok(left_result && right_result)
                    }
                    LogicalOp::Or => {
                        // 短路求值：如果左边为true，直接返回true
                        if left_result {
                            return Ok(true);
                        }
                        let right_result = self.evaluate_expression(right, context)?;
                        Ok(left_result || right_result)
                    }
                    LogicalOp::Not => unreachable!("Not should be handled by Expression::Not"),
                }
            }
            Expression::Not(inner) => {
                let result = self.evaluate_expression(inner, context)?;
                Ok(!result)
            }
            Expression::Parentheses(inner) => self.evaluate_expression(inner, context),
        }
    }

    fn evaluate_simple(
        &self,
        match_type: &MatchType,
        operator: &Operator,
        value: &str,
        context: &Context,
    ) -> Result<bool> {
        match match_type {
            MatchType::Text => {
                let text = context.text.as_deref().unwrap_or("");
                if let Some(lens) = &self.lens {
                    if !self.check_length(text.len(), lens) {
                        return Ok(false);
                    }
                }
                self.apply_operator(operator, value, text)
            }
            MatchType::Files => self.evaluate_files(operator, value, context),
            MatchType::Dirs => self.evaluate_dirs(operator, value, context),
            MatchType::ActiveFile => {
                let active_file = context.active_file.as_deref().unwrap_or("");
                self.apply_operator(operator, value, active_file)
            }
            MatchType::App => {
                let app_name = context.app_name.as_deref().unwrap_or("");
                self.apply_operator(operator, value, app_name)
            }
            MatchType::AppTitle => {
                let app_title = context.app_title.as_deref().unwrap_or("");
                self.apply_operator(operator, value, app_title)
            }
            MatchType::Workspace => {
                let workspace = context.workspace.as_deref().unwrap_or("");
                self.apply_operator(operator, value, workspace)
            }
            MatchType::FileExt => self.evaluate_file_extensions(operator, value, context),
        }
    }

    fn evaluate_files(&self, operator: &Operator, value: &str, context: &Context) -> Result<bool> {
        let files = context.files();

        if let Some(lens) = &self.lens {
            if !self.check_length(files.len(), lens) {
                return Ok(false);
            }
        }

        match operator {
            Operator::Any => Ok(!files.is_empty()),
            Operator::Equals => Ok(files.iter().any(|f| f.path == value || f.name == value)),
            Operator::NotEquals => Ok(!files.iter().any(|f| f.path == value || f.name == value)),
            Operator::Contains => Ok(files.iter().any(|f| f.path.contains(value) || f.name.contains(value))),
            Operator::NotContains => Ok(!files.iter().any(|f| f.path.contains(value) || f.name.contains(value))),
            Operator::Regex => {
                let regex = Regex::new(value)?;
                Ok(files.iter().any(|f| regex.is_match(&f.path) || regex.is_match(&f.name)))
            }
            Operator::NotRegex => {
                let regex = Regex::new(value)?;
                Ok(!files.iter().any(|f| regex.is_match(&f.path) || regex.is_match(&f.name)))
            }
        }
    }

    fn evaluate_dirs(&self, operator: &Operator, value: &str, context: &Context) -> Result<bool> {
        let dirs = context.directories();

        if let Some(lens) = &self.lens {
            if !self.check_length(dirs.len(), lens) {
                return Ok(false);
            }
        }

        match operator {
            Operator::Any => Ok(!dirs.is_empty()),
            Operator::Equals => Ok(dirs.iter().any(|d| d.path == value || d.name == value)),
            Operator::NotEquals => Ok(!dirs.iter().any(|d| d.path == value || d.name == value)),
            Operator::Contains => Ok(dirs.iter().any(|d| d.path.contains(value) || d.name.contains(value))),
            Operator::NotContains => Ok(!dirs.iter().any(|d| d.path.contains(value) || d.name.contains(value))),
            Operator::Regex => {
                let regex = Regex::new(value)?;
                Ok(dirs.iter().any(|d| regex.is_match(&d.path) || regex.is_match(&d.name)))
            }
            Operator::NotRegex => {
                let regex = Regex::new(value)?;
                Ok(!dirs.iter().any(|d| regex.is_match(&d.path) || regex.is_match(&d.name)))
            }
        }
    }

    fn evaluate_file_extensions(&self, operator: &Operator, value: &str, context: &Context) -> Result<bool> {
        let files_with_ext = context.files_with_extension(value);

        match operator {
            Operator::Any => Ok(!files_with_ext.is_empty()),
            Operator::Equals => Ok(files_with_ext.len() > 0),
            Operator::NotEquals => Ok(files_with_ext.is_empty()),
            _ => Ok(false), // 其他操作符对扩展名匹配无意义
        }
    }

    fn apply_operator(&self, operator: &Operator, pattern: &str, target: &str) -> Result<bool> {
        match operator {
            Operator::Equals => Ok(target == pattern),
            Operator::NotEquals => Ok(target != pattern),
            Operator::Contains => Ok(target.contains(pattern)),
            Operator::NotContains => Ok(!target.contains(pattern)),
            Operator::Regex => {
                let regex = Regex::new(pattern)?;
                Ok(regex.is_match(target))
            }
            Operator::NotRegex => {
                let regex = Regex::new(pattern)?;
                Ok(!regex.is_match(target))
            }
            Operator::Any => Ok(true),
        }
    }

    fn check_length(&self, actual: usize, lens: &[u32; 2]) -> bool {
        actual >= lens[0] as usize && actual <= lens[1] as usize
    }
}

/// 表达式解析器
pub struct Parser {
    input: String,
    pos: usize,
}

impl Parser {
    pub fn new(input: &str) -> Self {
        Self {
            input: input.to_string(),
            pos: 0,
        }
    }

    pub fn parse(&mut self) -> Result<Expression> {
        self.parse_or_expression()
    }

    fn parse_or_expression(&mut self) -> Result<Expression> {
        let mut left = self.parse_and_expression()?;

        while self.consume_whitespace() && self.consume_str("||") {
            self.consume_whitespace();
            let right = self.parse_and_expression()?;
            left = Expression::Logical {
                left: Box::new(left),
                op: LogicalOp::Or,
                right: Box::new(right),
            };
        }

        Ok(left)
    }

    fn parse_and_expression(&mut self) -> Result<Expression> {
        let mut left = self.parse_not_expression()?;

        while self.consume_whitespace() && self.consume_str("&&") {
            self.consume_whitespace();
            let right = self.parse_not_expression()?;
            left = Expression::Logical {
                left: Box::new(left),
                op: LogicalOp::And,
                right: Box::new(right),
            };
        }

        Ok(left)
    }

    fn parse_not_expression(&mut self) -> Result<Expression> {
        self.consume_whitespace();
        if self.consume_str("!") {
            self.consume_whitespace();
            let inner = self.parse_primary_expression()?;
            Ok(Expression::Not(Box::new(inner)))
        } else {
            self.parse_primary_expression()
        }
    }

    fn parse_primary_expression(&mut self) -> Result<Expression> {
        self.consume_whitespace();
        if self.consume_str("(") {
            let expr = self.parse_or_expression()?;
            self.consume_whitespace();
            if !self.consume_str(")") {
                return Err(MatchError::ParseError("Expected ')'".to_string()));
            }
            Ok(Expression::Parentheses(Box::new(expr)))
        } else {
            self.parse_comparison()
        }
    }

    fn parse_comparison(&mut self) -> Result<Expression> {
        self.consume_whitespace();
        let match_type = self.parse_match_type()?;
        self.consume_whitespace();
        let (operator, value) = self.parse_operator_and_value()?;

        Ok(Expression::Simple {
            match_type,
            operator,
            value,
        })
    }

    fn parse_match_type(&mut self) -> Result<MatchType> {
        let match_types = [
            ("activeFile", MatchType::ActiveFile),
            ("appTitle", MatchType::AppTitle),
            ("workspace", MatchType::Workspace),
            ("fileExt", MatchType::FileExt),
            ("text", MatchType::Text),
            ("files", MatchType::Files),
            ("dirs", MatchType::Dirs),
            ("app", MatchType::App),
        ];

        for (keyword, match_type) in &match_types {
            if self.peek_str(keyword) {
                // 检查单词边界 - 确保关键字后面跟着空格或操作符
                let next_pos = self.pos + keyword.len();
                if next_pos >= self.input.len()
                    || self.input.chars().nth(next_pos).unwrap().is_whitespace()
                    || self.input[next_pos..].starts_with("==")
                    || self.input[next_pos..].starts_with("!=")
                    || self.input[next_pos..].starts_with("=")
                {
                    self.pos += keyword.len();
                    return Ok(match_type.clone());
                }
            }
        }

        Err(MatchError::ParseError("Expected match type".to_string()))
    }

    fn parse_operator_and_value(&mut self) -> Result<(Operator, String)> {
        self.consume_whitespace();

        if self.consume_str("==") {
            self.consume_whitespace();
            let (value, is_regex) = self.parse_value_with_type()?;
            let operator = if value == "*" {
                Operator::Any
            } else if is_regex {
                Operator::Regex
            } else {
                Operator::Equals
            };
            Ok((operator, value))
        } else if self.consume_str("!=") {
            self.consume_whitespace();
            let (value, is_regex) = self.parse_value_with_type()?;
            let operator = if is_regex {
                Operator::NotRegex
            } else {
                Operator::NotEquals
            };
            Ok((operator, value))
        } else if self.consume_str("=") {
            self.consume_whitespace();
            let (value, is_regex) = self.parse_value_with_type()?;
            let operator = if is_regex { Operator::Regex } else { Operator::Contains };
            Ok((operator, value))
        } else {
            Err(MatchError::ParseError("Expected operator".to_string()))
        }
    }

    fn parse_value(&mut self) -> Result<String> {
        let (value, _) = self.parse_value_with_type()?;
        Ok(value)
    }

    fn parse_value_with_type(&mut self) -> Result<(String, bool)> {
        self.consume_whitespace();
        if self.current_char() == '\'' || self.current_char() == '"' {
            let value = self.parse_quoted_string()?;
            Ok((value, false))
        } else if self.current_char() == '/' {
            let value = self.parse_regex()?;
            Ok((value, true))
        } else if self.current_char() == '\\' {
            self.pos += 1; // 跳过反斜杠
            let value = self.parse_unquoted_string()?;
            Ok((value, true)) // 反斜杠开头作为正则表达式处理
        } else {
            let value = self.parse_unquoted_string()?;
            Ok((value, false))
        }
    }

    fn parse_quoted_string(&mut self) -> Result<String> {
        let quote_char = self.current_char();
        self.pos += 1; // 跳过开始引号

        let mut result = String::new();
        while self.pos < self.input.len() && self.current_char() != quote_char {
            if self.current_char() == '\\' && self.pos + 1 < self.input.len() {
                self.pos += 1;
                match self.current_char() {
                    'n' => result.push('\n'),
                    't' => result.push('\t'),
                    'r' => result.push('\r'),
                    '\\' => result.push('\\'),
                    '\'' => result.push('\''),
                    '"' => result.push('"'),
                    c => result.push(c),
                }
            } else {
                result.push(self.current_char());
            }
            self.pos += 1;
        }

        if self.pos >= self.input.len() {
            return Err(MatchError::ParseError("Unterminated string".to_string()));
        }

        self.pos += 1; // 跳过结束引号
        Ok(result)
    }

    fn parse_regex(&mut self) -> Result<String> {
        self.pos += 1; // 跳过开始的 '/'

        let mut result = String::new();
        while self.pos < self.input.len() && self.current_char() != '/' {
            if self.current_char() == '\\' && self.pos + 1 < self.input.len() {
                result.push(self.current_char());
                self.pos += 1;
                result.push(self.current_char());
            } else {
                result.push(self.current_char());
            }
            self.pos += 1;
        }

        if self.pos >= self.input.len() {
            return Err(MatchError::ParseError("Unterminated regex".to_string()));
        }

        self.pos += 1; // 跳过结束的 '/'
        Ok(result)
    }

    fn parse_unquoted_string(&mut self) -> Result<String> {
        let mut result = String::new();
        while self.pos < self.input.len() {
            let ch = self.current_char();
            if ch.is_whitespace() || ch == ')' || self.peek_str("&&") || self.peek_str("||") {
                break;
            }
            result.push(ch);
            self.pos += 1;
        }

        if result.is_empty() {
            return Err(MatchError::ParseError("Expected value".to_string()));
        }

        Ok(result)
    }

    fn consume_whitespace(&mut self) -> bool {
        let start_pos = self.pos;
        while self.pos < self.input.len() && self.current_char().is_whitespace() {
            self.pos += 1;
        }
        self.pos > start_pos
    }

    fn peek_str(&self, s: &str) -> bool {
        self.input[self.pos..].starts_with(s)
    }

    fn consume_str(&mut self, s: &str) -> bool {
        if self.peek_str(s) {
            self.pos += s.len();
            true
        } else {
            false
        }
    }

    fn current_char(&self) -> char {
        self.input.chars().nth(self.pos).unwrap_or('\0')
    }
}

// 为了向后兼容，保留一些旧的方法
impl Match {
    /// 兼容方法：验证文本
    pub fn validate_text(&self, text: &str) -> bool {
        let context = Context::new().with_text(text);
        self.matches(&context)
    }

    /// 兼容方法：验证文件列表（字符串路径）
    pub fn validate_files(&self, files: &[String]) -> bool {
        let file_entries: Vec<FileEntry> = files.iter().map(|path| FileEntry::new(path, FileType::File)).collect();
        let context = Context::new().with_files(file_entries);
        self.matches(&context)
    }

    /// 兼容方法：验证应用
    pub fn validate_app(&self, app_name: &str, app_title: Option<&str>) -> bool {
        let context = Context::new().with_app(app_name, app_title);
        self.matches(&context)
    }
}
