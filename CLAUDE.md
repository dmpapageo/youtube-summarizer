@AGENTS.md

## Open items (4 Sep 2026)
- The summarizer prompt is duplicated by hand in eval-harness (`runner/summarizer.py`). Proposed: move the prompt to a `.txt` here, vendor a copy in eval-harness with a hash and a CI drift check. Not built.
