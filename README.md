<p align="center">
  <img src="frontend/assets/logo.svg" alt="Notes Merger logo" width="112" />
</p>

<h1 align="center">Notes Merger</h1>

<p align="center">
  Turn messy PDFs, screenshots, Word docs, and rough notes into clean exam-ready study notes.
</p>

<p align="center">
  <a href="https://github.com/AfreenTahir/NotesMerger/releases">Download Installer</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#run-locally">Run Locally</a>
</p>

## What It Does

Notes Merger is a Rust + Tauri desktop app for students. Drop in class material, pick a course/topic, and the app extracts readable text, organizes it, and creates revision-friendly notes.

## Features

- Drag and drop PDFs, screenshots, DOCX, TXT, and Markdown notes.
- Extract selectable text from PDFs.
- OCR screenshots and scanned PDF pages locally.
- Generate structured study notes with headings, key points, terms, questions, and cheat sheets.
- Create flashcards and study-set questions from imported material.
- Organize files into course folders and topic workspaces.
- Copy or download generated notes.
- Runs as a Windows desktop app.

## Download

The Windows installer is published on GitHub Releases:

```text
Notes.Merger_0.1.0_x64-setup.exe
```

Direct download:

```text
https://github.com/AfreenTahir/NotesMerger/releases/download/v0.1.0/Notes.Merger_0.1.0_x64-setup.exe
```

## Run Locally

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

## Tech Stack

- Rust
- Tauri
- HTML, CSS, JavaScript
- PDF.js for PDF text extraction
- Tesseract.js for OCR
- Mammoth for DOCX text extraction

## Roadmap

- Improve scanned-PDF OCR speed and quality.
- Add persistent local storage for courses and notes.
- Add richer course/topic management.
- Add optional AI API mode for higher-quality study notes.
- Add exports to PDF, DOCX, and Anki-style flashcards.
