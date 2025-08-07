use std::path::Path;

/// Write the file only if the content of the existing file (if any) is different.
///
/// This will always write unless the file exists with identical content.
pub fn write_if_changed<P, C>(path: P, content: C) -> std::io::Result<()>
where
    P: AsRef<Path>,
    C: AsRef<[u8]>,
{
    if let Ok(existing) = std::fs::read(&path) {
        if existing == content.as_ref() {
            return Ok(());
        }
    }

    std::fs::write(path, content)
}
