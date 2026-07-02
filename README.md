# Notes Merger

Notes Merger is a Tauri desktop app for students who need to organize messy PDFs, screenshots, Word documents, and text notes into course folders and searchable topic sections.

## Current desktop prototype

- Rust/Tauri desktop shell in `src-tauri`
- Static app UI in `frontend`
- Drag-and-drop and file picker import
- Local PDF text extraction
- Local OCR for screenshots and scanned PDF pages
- Local DOCX and TXT reading
- Generated study notes with key points, terms, source highlights, review questions, copy, and download
- Course/topic navigation
- Searchable document table
- Document inspector with merge summary, tags, and product roadmap

## Run locally

Install dependencies:

```powershell
npm.cmd install --cache .\.npm-cache
```

Start the Tauri desktop app:

```powershell
npm.cmd run dev
```

Build the desktop installer/app bundle:

```powershell
npm.cmd run build
```

If PowerShell blocks `npm`, use `npm.cmd` as shown above.

## Product plan

1. Import: accept PDFs, screenshots, DOCX, TXT, Markdown, and pasted notes.
2. Extract: parse documents and run OCR on screenshots/scans.
3. Organize: detect course names, topic headings, tags, duplicates, and weak file names.
4. Merge: combine related notes into clean topic sections with source citations.
5. Study: add search, summaries, flashcards, quizzes, and exportable study packs.
6. Sync: add accounts, cloud storage, collaboration, and cross-device sync.

## Next implementation steps

- Add Tauri file-drop events for native desktop drag-and-drop.
- Store imported file metadata in a local SQLite database.
- Add a Rust command layer for faster document parsing and indexing.
- Add course/topic creation flows and persistent search.
