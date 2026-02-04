# Master System Invariants (MLStudio Pro)

1. **Dependency Hierarchy**: Core (Logic) -> UI (Presentation) -> Docs (Human). Core must never depend on UI or Docs.
2. **Runtime Independence**: The execution engine handles labs via local system calls; it has no knowledge of curriculum structure or navigation paths.
3. **Immutability of History**: All versioned content is final. New versions (V4+) must not mutate previous versions.
4. **Gated Extensions**: Runtime extensions (V4+) must be feature-gated and strictly optional. Baseline behavior must be restorable by deleting extensions.
