use std::sync::Arc;

pub struct JsHost {}

impl JsHost {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {})
    }
}

pub struct JsExtension {}

pub struct JsState {}
