const sampleText = `Cell respiration is the process cells use to convert glucose into usable ATP energy. Glycolysis happens in the cytoplasm and splits glucose into pyruvate. The Krebs cycle happens in the mitochondrial matrix and releases carbon dioxide while transferring energy to NADH and FADH2. The electron transport chain uses electrons from NADH and FADH2 to pump hydrogen ions across the inner mitochondrial membrane. Oxygen is the final electron acceptor. ATP synthase uses the hydrogen ion gradient to produce most of the ATP. Fermentation can regenerate NAD+ when oxygen is not available, but it produces much less ATP than aerobic respiration.`;

const courses = [
  {
    id: "bio",
    name: "Biology 201",
    term: "Spring 2026",
    icon: "DNA",
    topics: [
      {
        id: "cell",
        name: "Cell Respiration",
        docs: [
          doc("Lecture 8 - glycolysis.pdf", "PDF", 3, 126, "Demo", "Canvas", "Ready", sampleText),
          doc("whiteboard-cycle.jpg", "IMG", 1, 82, "Demo", "Screenshot", "Ready", "Mitochondria make ATP through glycolysis, Krebs cycle, electron transport chain, and ATP synthase. Oxygen accepts electrons at the end.")
        ]
      },
      {
        id: "genetics",
        name: "Mendelian Genetics",
        docs: [doc("Punnett square recap.pdf", "PDF", 2, 70, "Demo", "Canvas", "Ready", "Dominant alleles can mask recessive alleles. Punnett squares show genotype probabilities and phenotype ratios.")]
      }
    ]
  },
  {
    id: "math",
    name: "Linear Algebra",
    term: "Summer 2026",
    icon: "LA",
    topics: [
      {
        id: "eigen",
        name: "Eigenvectors",
        docs: [doc("eigenvectors lecture.pdf", "PDF", 4, 95, "Demo", "Canvas", "Ready", "An eigenvector keeps its direction when multiplied by a matrix. The eigenvalue is the scale factor. Solve det(A minus lambda I) equals zero to find eigenvalues.")]
      },
      {
        id: "basis",
        name: "Basis and Span",
        docs: []
      }
    ]
  },
  {
    id: "hist",
    name: "World History",
    term: "Fall 2026",
    icon: "WH",
    topics: [
      {
        id: "coldwar",
        name: "Cold War",
        docs: [doc("containment policy.pdf", "PDF", 3, 88, "Demo", "Canvas", "Ready", "Containment was a United States policy aimed at limiting the spread of Soviet influence after World War II. NATO, the Truman Doctrine, and the Marshall Plan were connected to this strategy.")]
      }
    ]
  }
];

let selectedCourseId = "bio";
let selectedTopicId = "cell";
let selectedDocId = courses[0].topics[0].docs[0].id;
let searchTerm = "";
let pdfModulePromise = null;
let latestNotesMarkdown = "";
let activeView = "notes";

const courseList = document.querySelector("#courseList");
const addCourseButton = document.querySelector("#addCourseButton");
const courseTitle = document.querySelector("#courseTitle");
const topicTitle = document.querySelector("#topicTitle");
const documentRows = document.querySelector("#documentRows");
const detailCard = document.querySelector("#detailCard");
const mergeSummary = document.querySelector("#mergeSummary");
const dropZone = document.querySelector("#dropZone");
const filePicker = document.querySelector("#filePicker");
const browseButton = document.querySelector("#browseButton");
const importButton = document.querySelector("#importButton");
const searchInput = document.querySelector("#searchInput");
const tableFooter = document.querySelector("#tableFooter");
const roadmap = document.querySelector("#roadmap");
const processingStatus = document.querySelector("#processingStatus");
const notesPage = document.querySelector("#notesPage");
const notesMeta = document.querySelector("#notesMeta");
const copyNotesButton = document.querySelector("#copyNotesButton");
const downloadNotesButton = document.querySelector("#downloadNotesButton");
const tabButtons = document.querySelectorAll(".tab[data-view]");
const viewPanels = document.querySelectorAll(".view-panel");
const flashcardGrid = document.querySelector("#flashcardGrid");
const flashcardsMeta = document.querySelector("#flashcardsMeta");
const questionList = document.querySelector("#questionList");
const studySetMeta = document.querySelector("#studySetMeta");

function doc(name, type, pages, words, added, source, quality, extractedText = "") {
  return {
    id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    type,
    pages,
    words,
    added,
    source,
    quality,
    extractedText,
    error: ""
  };
}

function currentCourse() {
  return courses.find((course) => course.id === selectedCourseId);
}

function currentTopic() {
  return currentCourse().topics.find((topic) => topic.id === selectedTopicId);
}

function currentDocs() {
  const term = searchTerm.trim().toLowerCase();
  const docs = currentTopic().docs;

  if (!term) {
    return docs;
  }

  return docs.filter((item) => {
    return [item.name, item.type, item.source, item.quality, item.extractedText, currentTopic().name, currentCourse().name]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });
}

function render() {
  renderCourses();
  renderMain();
  renderDocuments();
  renderDetails();
  renderNotes();
  renderTabs();
  renderFlashcards();
  renderStudySet();
}

function renderCourses() {
  courseList.innerHTML = "";

  courses.forEach((course) => {
    const count = course.topics.reduce((total, topic) => total + topic.docs.length, 0);
    const button = document.createElement("button");
    button.className = `course-item${course.id === selectedCourseId ? " active" : ""}`;
    button.innerHTML = `
      <span class="course-icon">${escapeHtml(course.icon)}</span>
      <span class="course-copy">
        <strong>${escapeHtml(course.name)}</strong>
        <span>${course.topics.length} topics - ${count} docs</span>
      </span>
    `;
    button.addEventListener("click", () => {
      selectedCourseId = course.id;
      selectedTopicId = course.topics[0].id;
      selectedDocId = course.topics[0].docs[0]?.id ?? "";
      render();
    });
    courseList.append(button);
  });
}

function addCourse() {
  const name = window.prompt("Course name? Example: Physics 101");
  const courseName = cleanInput(name);

  if (!courseName) {
    setStatus("Course was not added.");
    return;
  }

  const topicName = cleanInput(window.prompt("First topic name? Example: Motion and Forces") || "General Notes") || "General Notes";
  const id = slugify(courseName);
  const uniqueId = uniqueCourseId(id);
  const newCourse = {
    id: uniqueId,
    name: courseName,
    term: "New course",
    icon: initials(courseName),
    topics: [
      {
        id: slugify(topicName),
        name: topicName,
        docs: []
      }
    ]
  };

  courses.unshift(newCourse);
  selectedCourseId = newCourse.id;
  selectedTopicId = newCourse.topics[0].id;
  selectedDocId = "";
  searchTerm = "";
  searchInput.value = "";
  setStatus(`Added ${courseName}. Drop PDFs or screenshots to make notes.`);
  render();
}

function renderMain() {
  const course = currentCourse();
  const topic = currentTopic();
  const docs = topic.docs;
  const pageCount = docs.reduce((total, item) => total + item.pages, 0);
  const wordCount = docs.reduce((total, item) => total + item.words, 0);

  courseTitle.textContent = course.name;
  topicTitle.textContent = topic.name;
  document.querySelector("#statDocs").textContent = docs.length;
  document.querySelector("#statPages").textContent = pageCount;
  document.querySelector("#statWords").textContent = wordCount.toLocaleString();
  document.querySelector("#statUpdated").textContent = docs[0]?.added ?? "No files";
}

function renderDocuments() {
  const docs = currentDocs();
  documentRows.innerHTML = "";

  docs.forEach((item) => {
    const row = document.createElement("tr");
    row.className = item.id === selectedDocId ? "selected" : "";
    row.innerHTML = `
      <td><input type="checkbox" aria-label="Select ${escapeHtml(item.name)}" /></td>
      <td>
        <button class="doc-name row-reset">
          <span class="doc-file-icon ${typeClass(item.type)}">${escapeHtml(item.type)}</span>
          <span class="name-stack">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.error || currentTopic().name)}</span>
          </span>
        </button>
      </td>
      <td>${escapeHtml(item.type)}</td>
      <td>${item.pages}</td>
      <td>${item.words.toLocaleString()}</td>
      <td>${escapeHtml(item.added)}</td>
      <td><span class="source-pill">${escapeHtml(item.source)}</span></td>
      <td><span class="quality-pill">${escapeHtml(item.quality)}</span></td>
    `;
    row.querySelector(".doc-name").addEventListener("click", () => {
      selectedDocId = item.id;
      renderDocuments();
      renderDetails();
    });
    documentRows.append(row);
  });

  const total = currentTopic().docs.length;
  tableFooter.textContent = searchTerm
    ? `Showing ${docs.length} matching ${plural(docs.length, "document")}`
    : `Showing ${docs.length} of ${total} ${plural(total, "document")}`;
}

function renderDetails() {
  const docs = currentTopic().docs;
  const selected = docs.find((item) => item.id === selectedDocId) ?? docs[0];

  if (!selected) {
    detailCard.innerHTML = `
      <div class="doc-preview"><span class="type-txt">NEW</span></div>
      <h3>No document selected</h3>
      <p>Import a file to start generating notes for this topic.</p>
    `;
    mergeSummary.innerHTML = "<li>Waiting for the first document.</li>";
    return;
  }

  const snippet = selected.extractedText
    ? selected.extractedText.slice(0, 360)
    : selected.error || "Text has not been extracted yet.";

  detailCard.innerHTML = `
    <div class="doc-preview"><span class="${typeClass(selected.type)}">${escapeHtml(selected.type)}</span></div>
    <h3>${escapeHtml(selected.name)}</h3>
    <p>${escapeHtml(snippet)}${selected.extractedText.length > 360 ? "..." : ""}</p>
    <div class="detail-grid">
      <div><span>Course</span><strong>${escapeHtml(currentCourse().name)}</strong></div>
      <div><span>Topic</span><strong>${escapeHtml(currentTopic().name)}</strong></div>
      <div><span>Type</span><strong>${escapeHtml(selected.type)}</strong></div>
      <div><span>Pages</span><strong>${selected.pages}</strong></div>
      <div><span>Words</span><strong>${selected.words.toLocaleString()}</strong></div>
      <div><span>Status</span><strong><span class="quality-pill">${escapeHtml(selected.quality)}</span></strong></div>
    </div>
  `;

  const readyDocs = docs.filter((item) => item.extractedText.trim());
  mergeSummary.innerHTML = [
    `${readyDocs.length} of ${docs.length} files have extracted text.`,
    `${readyDocs.reduce((total, item) => total + item.words, 0).toLocaleString()} searchable words available.`,
    readyDocs.length ? "Generated notes update automatically after each import." : "Import a readable file to generate notes."
  ]
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");
}

function renderNotes() {
  const result = generateStudyNotes(currentTopic(), currentCourse());
  latestNotesMarkdown = result.markdown;
  notesPage.innerHTML = result.html;
  notesMeta.textContent = result.meta;
}

function renderTabs() {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === activeView);
  });

  viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === activeView);
  });
}

function renderFlashcards() {
  const study = getStudyData(currentTopic());
  flashcardsMeta.textContent = study.readyDocs.length
    ? `${study.cards.length} cards from ${study.readyDocs.length} ${plural(study.readyDocs.length, "source")}.`
    : "Import a readable PDF, screenshot, DOCX, or TXT file to create flashcards.";

  if (!study.readyDocs.length) {
    flashcardGrid.innerHTML = emptyPanelHtml("No flashcards yet", readableImportMessage(currentTopic()));
    return;
  }

  flashcardGrid.innerHTML = study.cards
    .map((card) => `
      <article class="flashcard">
        <span>Question</span>
        <h3>${escapeHtml(card.front)}</h3>
        <div><strong>Answer</strong><p>${formatInline(card.back, study.terms)}</p></div>
      </article>
    `)
    .join("");
}

function renderStudySet() {
  const study = getStudyData(currentTopic());
  studySetMeta.textContent = study.readyDocs.length
    ? `${study.questions.length} exam-style questions ready.`
    : "Import readable source material to create an exam practice set.";

  if (!study.readyDocs.length) {
    questionList.innerHTML = emptyPanelHtml("No study set yet", readableImportMessage(currentTopic()));
    return;
  }

  questionList.innerHTML = study.questions
    .map((question, index) => `
      <article class="study-question">
        <strong>Q${index + 1}</strong>
        <p>${escapeHtml(question)}</p>
      </article>
    `)
    .join("");
}

function getStudyData(topic) {
  const readyDocs = topic.docs.filter((item) => item.extractedText.trim());
  const allText = readyDocs.map((item) => item.extractedText).join("\n\n");
  const sentences = splitSentences(allText);
  const terms = getImportantTerms(allText, 16);
  const keyPoints = pickBestSentences(sentences, terms, 12);
  const definitions = findDefinitionLikeSentences(sentences, terms, 10);
  const questions = makeReviewQuestions(terms, keyPoints, definitions, 10);
  const cards = terms.slice(0, 10).map((term) => ({
    front: `What is ${titleCase(term)}?`,
    back: definitionForTerm(term, definitions, keyPoints)
  }));

  return { readyDocs, allText, sentences, terms, keyPoints, definitions, questions, cards };
}

function emptyPanelHtml(title, message) {
  return `
    <div class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function readableImportMessage(topic) {
  const latest = topic.docs[0];

  if (!latest) {
    return "Drop a PDF, screenshot, DOCX, or TXT file into the import box first.";
  }

  if (latest.error) {
    return `${latest.name}: ${latest.error}`;
  }

  return "The last file did not produce readable text. If it is scanned, try importing one clear screenshot page first.";
}

async function handleFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  const topic = currentTopic();
  const importedItems = files.map((file) => {
    const type = inferType(file);
    const item = doc(file.name, type, estimatePages(file, type), 0, "Queued", "Imported", "Queued");
    item.file = file;
    return item;
  });

  topic.docs.unshift(...importedItems);
  selectedDocId = importedItems[0].id;
  activeView = "documents";
  setStatus(`${files.length} ${plural(files.length, "file")} added. Processing in the background...`);
  render();

  window.setTimeout(() => processImportedItems(importedItems), 80);
}

async function processImportedItems(items) {
  let completed = 0;

  for (const item of items) {
    const file = item.file;
    const type = item.type;
    selectedDocId = item.id;
    item.quality = "Reading";
    item.added = "Processing";
    render();

    try {
      setStatus(`Reading ${file.name}...`);
      await waitForUi();
      const extracted = await withTimeout(extractFile(file, type, item), 120000, `${file.name} took too long. It may be scanned, protected, or too large. Try exporting only the important pages as screenshots.`);
      item.extractedText = normalizeText(extracted.text);
      item.pages = extracted.pages;
      item.words = countWords(item.extractedText);
      item.added = "Just now";
      item.quality = item.words > 8 ? "Ready" : "Needs review";
      item.error = item.words > 8 ? "" : "Very little text found. If this is a scanned PDF, try a clearer file or import the important pages as screenshots.";
    } catch (error) {
      item.pages = item.pages || estimatePages(file, type);
      item.words = 0;
      item.added = "Just now";
      item.quality = "Needs review";
      item.error = readableError(error);
      item.extractedText = "";
    }

    delete item.file;
    completed += 1;
    render();
    setStatus(`Processed ${completed} of ${items.length} ${plural(items.length, "file")}.`);
    await waitForUi();
  }

  const readyCount = currentTopic().docs.filter((item) => item.extractedText.trim()).length;
  if (readyCount) {
    activeView = "notes";
    setStatus("Done. Your study notes are ready below.");
  } else {
    activeView = "documents";
    setStatus("Import finished, but no readable text was found. Check the document status below.");
  }
  render();
}

async function extractFile(file, type, item) {
  if (type === "TXT") {
    return { text: await file.text(), pages: 1 };
  }

  if (type === "DOCX") {
    if (!window.mammoth) throw new Error("DOCX reader is not loaded.");
    const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { text: result.value, pages: estimatePages(file, type) };
  }

  if (type === "DOC") {
    throw new Error("Old .doc files are not supported yet. Save as .docx and import again.");
  }

  if (type === "PDF") {
    return extractPdf(file, item);
  }

  if (type === "IMG") {
    return { text: await ocrImage(file), pages: 1 };
  }

  throw new Error("Unsupported file type.");
}

async function getPdfModule() {
  if (!pdfModulePromise) {
    pdfModulePromise = import("./vendor/pdfjs/pdf.min.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "";
      return pdfjs;
    });
  }
  return pdfModulePromise;
}

async function extractPdf(file, item) {
  const pdfjs = await getPdfModule();
  setStatus(`Opening PDF: ${file.name}...`);
  const pdfData = new Uint8Array(await file.arrayBuffer());
  const pdf = await withTimeout(
    pdfjs.getDocument({
      data: pdfData,
      disableWorker: true,
      isEvalSupported: false,
      useSystemFonts: true
    }).promise,
    45000,
    `Could not open ${file.name}. The PDF may be encrypted, damaged, or too large.`
  );
  const chunks = [];
  let scannedPages = 0;
  const maxPdfOcrPages = 12;
  let skippedScannedPages = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    setStatus(`Reading ${file.name}: page ${pageNumber} of ${pdf.numPages}...`);
    await waitForUi();
    const page = await withTimeout(pdf.getPage(pageNumber), 25000, `Page ${pageNumber} took too long to open.`);
    const content = await withTimeout(page.getTextContent(), 25000, `Page ${pageNumber} text extraction took too long.`);
    const pageText = content.items.map((part) => part.str).join(" ");

    if (pageText.trim().length > 35) {
      chunks.push(pageText);
    } else if (scannedPages < maxPdfOcrPages) {
      scannedPages += 1;
      setStatus(`PDF page has no selectable text. OCR page ${pageNumber} of ${pdf.numPages}...`);
      try {
        const ocrText = await withTimeout(ocrPdfPage(page), 60000, `OCR page ${pageNumber} took too long.`);
        if (countWords(ocrText) > 3) {
          chunks.push(ocrText);
        }
      } catch (error) {
        chunks.push(``);
        item.error = `OCR had trouble on page ${pageNumber}: ${readableError(error)}`;
      }
    } else {
      skippedScannedPages += 1;
    }

    item.pages = pageNumber;
    item.words = countWords(chunks.join(" "));
    renderMain();
    renderDocuments();
  }

  const readableText = chunks.join("\n\n").trim();
  const note = skippedScannedPages
    ? `\n\nNote: This PDF appears to be scanned. Notes Merger OCR processed ${scannedPages} page(s) and skipped ${skippedScannedPages} page(s) for speed. Import important pages as screenshots for best OCR.`
    : "";

  if (countWords(readableText) < 5) {
    throw new Error("This PDF has no selectable text, and OCR could not read the scanned pages clearly. Try exporting the PDF pages as clear PNG/JPG screenshots and import those.");
  }

  return { text: `${readableText}${note}`, pages: pdf.numPages };
}

async function ocrPdfPage(page) {
  const viewport = page.getViewport({ scale: 2.6 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return ocrImage(preprocessCanvas(canvas));
}

function preprocessCanvas(sourceCanvas) {
  const canvas = document.createElement("canvas");
  const maxWidth = 2600;
  const scale = sourceCanvas.width > maxWidth ? maxWidth / sourceCanvas.width : 1;
  canvas.width = Math.floor(sourceCanvas.width * scale);
  canvas.height = Math.floor(sourceCanvas.height * scale);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const contrasted = gray > 185 ? 255 : gray < 95 ? 0 : gray * 1.18;
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }

  context.putImageData(image, 0, 0);
  return canvas;
}

async function ocrImage(source) {
  if (!window.Tesseract) {
    throw new Error("OCR engine is not loaded.");
  }

  const result = await window.Tesseract.recognize(source, "eng", {
    workerPath: "./vendor/tesseract/worker.min.js",
    corePath: "./vendor/tesseract/core",
    langPath: "./vendor/tesseract/lang",
    gzip: true,
    tessedit_pageseg_mode: "6",
    logger: (message) => {
      if (message.status) {
        const percent = Number.isFinite(message.progress) ? ` ${Math.round(message.progress * 100)}%` : "";
        setStatus(`OCR ${message.status}${percent}`);
      }
    }
  });

  return result.data.text;
}

function generateStudyNotes(topic, course) {
  const study = getStudyData(topic);
  const readyDocs = study.readyDocs;

  if (!readyDocs.length) {
    return {
      meta: "No readable text found yet.",
      markdown: "",
      html: `
        <h3>No generated notes yet</h3>
        <p class="empty-note">${escapeHtml(readableImportMessage(topic))}</p>
      `
    };
  }

  const allText = study.allText;
  const sentences = study.sentences;
  const terms = study.terms;
  const keyPoints = study.keyPoints;
  const definitions = study.definitions;
  const steps = findProcessSteps(sentences, terms, 7);
  const mistakes = findMistakes(sentences, terms);
  const comparisons = buildComparisonRows(terms, sentences);
  const formulas = findFormulaLikeSentences(sentences);
  const overviewRemember = rememberItems(keyPoints, terms, 5);
  const termsRemember = rememberItems(definitions, terms, 4);
  const formulaRemember = rememberItems(formulas, terms, 3);
  const processRemember = rememberItems(steps, terms, 4);
  const comparisonRemember = rememberItems(comparisons.map((row) => `${titleCase(row.term)}: ${row.remember}`), terms, 4);
  const sourceHighlights = readyDocs.map((item) => ({
    name: item.name,
    points: pickBestSentences(splitSentences(item.extractedText), terms, 2)
  }));
  const questions = study.questions;
  const examRemember = rememberItems([...mistakes, ...questions], terms, 5);
  const cheatSheet = buildCheatSheet(topic.name, terms, keyPoints, definitions, steps, formulas);
  const title = `${topic.name} Premium Study Notes`;
  const meta = `${readyDocs.length} ${plural(readyDocs.length, "source")} - ${countWords(allText).toLocaleString()} words processed`;
  const bigIdea = buildBigIdea(topic.name, keyPoints);

  const markdown = [
    `# ${title}`,
    `Course: ${course.name}`,
    `Sources: ${readyDocs.map((item) => item.name).join(", ")}`,
    "",
    `> 📌 Big Idea: ${bigIdea}`,
    "",
    "## 1. Clean Concept Overview",
    ...keyPoints.slice(0, 6).map((point) => `- ${boldKeywords(point, terms)}`),
    "",
    rememberMarkdown(overviewRemember),
    "",
    "## 2. Key Terms",
    ...terms.slice(0, 12).map((term) => `- **${titleCase(term)}**: ${definitionForTerm(term, definitions, keyPoints)}`),
    "",
    rememberMarkdown(termsRemember),
    "",
    "## 3. Definitions and Important Facts",
    ...(definitions.length ? definitions.map((line) => `> ✅ ${boldKeywords(line, terms)}`) : ["> ✅ Add more source text to extract stronger definitions."]),
    ...(formulas.length ? ["", "## 4. Formulas / Exact Facts", ...formulas.map((line) => `> 📌 ${line}`), "", rememberMarkdown(formulaRemember)] : []),
    "",
    "## 5. Step-by-Step Process",
    ...(steps.length ? steps.map((step, index) => `${index + 1}. ${boldKeywords(step, terms)}`) : ["1. No clear process sequence was found in the sources."]),
    "",
    rememberMarkdown(processRemember),
    "",
    "## 6. Comparison Table",
    "| Concept | What to remember | Exam clue |",
    "|---|---|---|",
    ...comparisons.map((row) => `| **${titleCase(row.term)}** | ${row.remember} | ${row.clue} |`),
    "",
    rememberMarkdown(comparisonRemember),
    "",
    "## 7. Examples / Analogies",
    ...makeExamples(topic.name, terms).map((line) => `- 💡 ${line}`),
    "",
    "## 8. Common Mistakes",
    ...mistakes.map((line) => `- ⚠️ ${boldKeywords(line, terms)}`),
    "",
    "## 9. Memory Tricks",
    ...makeMnemonics(terms).map((line) => `- ${line}`),
    "",
    rememberMarkdown(examRemember),
    "",
    "## Source Highlights",
    ...sourceHighlights.flatMap((source) => [`### ${source.name}`, ...source.points.map((point) => `- ${point}`)]),
    "",
    "## Exam-Style Questions",
    ...questions.map((question, index) => `${index + 1}. ${question}`),
    "",
    "## Final Cheat Sheet",
    ...cheatSheet.map((line) => `- ${line}`),
    "",
    "## Sources Used",
    ...readyDocs.map((item) => `- ${item.name} (${item.type}, ${item.words.toLocaleString()} words)`)
  ].join("\n");

  const html = `
    <h1>${escapeHtml(title)}</h1>
    <p><strong>Course:</strong> ${escapeHtml(course.name)}</p>
    <p>${readyDocs.map((item) => `<span class="note-source">${escapeHtml(item.name)}</span>`).join("")}</p>
    <div class="study-callout big-idea"><strong>📌 Big Idea</strong><span>${formatInline(bigIdea, terms)}</span></div>
    <h2>1. Clean Concept Overview</h2>
    <ul>${keyPoints.slice(0, 6).map((point) => `<li>${formatInline(point, terms)}</li>`).join("")}</ul>
    ${rememberHtml(overviewRemember, terms)}
    <h2>2. Key Terms</h2>
    <div class="term-grid">${terms.slice(0, 12).map((term) => `<div><strong>${escapeHtml(titleCase(term))}</strong><span>${formatInline(definitionForTerm(term, definitions, keyPoints), terms)}</span></div>`).join("")}</div>
    ${rememberHtml(termsRemember, terms)}
    <h2>3. Definitions and Important Facts</h2>
    ${(definitions.length ? definitions : ["Add more source text to extract stronger definitions."]).map((line) => `<div class="study-callout fact"><strong>✅ Important</strong><span>${formatInline(line, terms)}</span></div>`).join("")}
    ${formulas.length ? `<h2>4. Formulas / Exact Facts</h2>${formulas.map((line) => `<div class="study-callout formula"><strong>📌 Formula / Fact</strong><span>${escapeHtml(line)}</span></div>`).join("")}${rememberHtml(formulaRemember, terms)}` : ""}
    <h2>5. Step-by-Step Process</h2>
    <ol>${(steps.length ? steps : ["No clear process sequence was found in the sources."]).map((step) => `<li>${formatInline(step, terms)}</li>`).join("")}</ol>
    ${rememberHtml(processRemember, terms)}
    <h2>6. Comparison Table</h2>
    <div class="study-table-wrap"><table class="study-table"><thead><tr><th>Concept</th><th>What to remember</th><th>Exam clue</th></tr></thead><tbody>${comparisons.map((row) => `<tr><td><strong>${escapeHtml(titleCase(row.term))}</strong></td><td>${formatInline(row.remember, terms)}</td><td>${escapeHtml(row.clue)}</td></tr>`).join("")}</tbody></table></div>
    ${rememberHtml(comparisonRemember, terms)}
    <h2>7. Examples / Analogies</h2>
    <ul>${makeExamples(topic.name, terms).map((line) => `<li>💡 ${formatInline(line, terms)}</li>`).join("")}</ul>
    <h2>8. Common Mistakes</h2>
    <ul>${mistakes.map((line) => `<li>⚠️ ${formatInline(line, terms)}</li>`).join("")}</ul>
    <h2>9. Memory Tricks</h2>
    <ul>${makeMnemonics(terms).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
    ${rememberHtml(examRemember, terms)}
    <h2>Source Highlights</h2>
    ${sourceHighlights
      .map((source) => `
        <h3>${escapeHtml(source.name)}</h3>
        <ul>${(source.points.length ? source.points : ["No strong highlight found."]).map((point) => `<li>${formatInline(point, terms)}</li>`).join("")}</ul>
      `)
      .join("")}
    <h2>Exam-Style Questions</h2>
    <ol>${questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol>
    <div class="cheat-sheet">
      <h2>Final Cheat Sheet</h2>
      <ul>${cheatSheet.map((line) => `<li>${formatInline(line, terms)}</li>`).join("")}</ul>
    </div>
  `;

  return { meta, markdown, html };
}

function buildBigIdea(topicName, keyPoints) {
  if (!keyPoints.length) {
    return `${topicName} is the main idea from your uploaded sources, organized into exam-ready notes.`;
  }

  const firstPoint = keyPoints[0].replace(/\.$/, "");
  return `${topicName} is mainly about this: ${firstPoint}.`;
}

function pickBestSentences(sentences, terms, limit) {
  const seen = new Set();
  return sentences
    .map((sentence) => ({ sentence, score: scoreSentence(sentence, terms) }))
    .filter((item) => item.sentence.length > 35 && item.sentence.length < 260)
    .sort((a, b) => b.score - a.score)
    .map((item) => cleanSentence(item.sentence))
    .filter((sentence) => {
      const key = sentence.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function scoreSentence(sentence, terms) {
  const lower = sentence.toLowerCase();
  const termScore = terms.reduce((score, term) => score + (lower.includes(term) ? 3 : 0), 0);
  const signalScore = /(important|because|therefore|causes|process|function|result|means|defined|called|used|shows|final|main)/i.test(sentence) ? 2 : 0;
  const lengthScore = sentence.length > 70 && sentence.length < 190 ? 2 : 0;
  return termScore + signalScore + lengthScore;
}

function findDefinitionLikeSentences(sentences, terms, limit) {
  return sentences
    .filter((sentence) => /( is | are | refers to | means | defined as | called | consists of )/i.test(sentence))
    .filter((sentence) => terms.some((term) => sentence.toLowerCase().includes(term)))
    .map(cleanSentence)
    .slice(0, limit);
}

function findProcessSteps(sentences, terms, limit) {
  const processSignals = /(first|second|third|next|then|after|finally|step|process|cycle|pathway|starts|begins|ends|produces|leads to|results in)/i;
  const processSentences = sentences
    .filter((sentence) => processSignals.test(sentence) || terms.some((term) => sentence.toLowerCase().includes(term)))
    .map(cleanSentence);

  return uniqueLines(processSentences).slice(0, limit);
}

function findMistakes(sentences, terms) {
  const explicitMistakes = sentences
    .filter((sentence) => /(mistake|misconception|confuse|not the same|however|instead|although|except|without|less than|more than)/i.test(sentence))
    .map(cleanSentence);

  const generated = terms.slice(0, 4).map((term) => `Do not memorize **${titleCase(term)}** as an isolated word; connect it to what it does and where it appears in the topic.`);
  return uniqueLines([...explicitMistakes, ...generated]).slice(0, 6);
}

function findFormulaLikeSentences(sentences) {
  return uniqueLines(
    sentences
      .filter((sentence) => /[=+\-×÷→]|formula|equation|law|ratio|percent|constant|ATP|NADH|FADH2|\d+\s*(%|mol|g|kg|cm|mm|mL|L|ATP)/i.test(sentence))
      .map(cleanSentence)
  ).slice(0, 6);
}

function buildComparisonRows(terms, sentences) {
  const rows = terms.slice(0, 5).map((term) => {
    const sentence = sentences.find((line) => line.toLowerCase().includes(term)) || `${titleCase(term)} is an important idea from the source material.`;
    return {
      term,
      remember: cleanSentence(sentence).slice(0, 130),
      clue: `If a question mentions ${titleCase(term)}, recall its role and related process.`
    };
  });

  return rows.length ? rows : [{ term: "main idea", remember: "Review the strongest repeated point from the sources.", clue: "Look for repeated keywords." }];
}

function makeExamples(topicName, terms) {
  const mainTerm = titleCase(terms[0] || topicName);
  return [
    `Think of **${mainTerm}** as the central label you attach to questions about ${topicName}.`,
    `If two source files mention the same idea, treat it as high-yield and revise it first.`,
    `When solving an exam question, ask: "What is happening, why does it happen, and what is the result?"`
  ];
}

function makeMnemonics(terms) {
  const chosen = terms.slice(0, 4).map(titleCase);

  if (!chosen.length) {
    return ["Memory trick: turn the main heading into a 3-word phrase and repeat it before practice questions."];
  }

  const initials = chosen.map((term) => term[0]).join("-");
  return [
    `Memory trick: remember the chain ${initials} for ${chosen.join(", ")}.`,
    `Say it as: "${chosen.join(" -> ")}" to recall the order of important ideas.`
  ];
}

function makeReviewQuestions(terms, keyPoints, definitions, limit) {
  const questions = [];

  if (keyPoints.length) {
    questions.push("Short answer: Explain the Big Idea of this topic in 2-3 lines.");
    questions.push(`Conceptual: Why is this point important: "${keyPoints[0]}"?`);
  }

  terms.slice(0, 4).forEach((term) => {
    questions.push(`MCQ: Which statement best explains **${titleCase(term)}**?`);
    questions.push(`Short question: Define **${titleCase(term)}** and give one related example.`);
  });

  if (definitions.length) {
    questions.push("Conceptual: Pick one definition from the notes and explain it without using the exact wording.");
  }

  questions.push("Exam skill: List two common mistakes students make in this topic.");

  return questions.slice(0, limit);
}

function rememberItems(lines, terms, limit) {
  const source = uniqueLines(lines.map((line) => String(line || "").replace(/<[^>]+>/g, "").trim()).filter(Boolean));
  const selected = source.slice(0, limit);

  while (selected.length < 3 && terms[selected.length]) {
    selected.push(`${titleCase(terms[selected.length])} is high-yield; know its meaning, role, and exam clue.`);
  }

  if (!selected.length) {
    selected.push("Focus on the repeated ideas from your uploaded sources.");
    selected.push("Revise definitions, steps, and differences first.");
    selected.push("Practice explaining the topic without looking at the notes.");
  }

  return selected.slice(0, Math.max(3, Math.min(5, limit)));
}

function rememberMarkdown(items) {
  return [
    "> ✅ **Remember This**",
    ...items.map((item) => `> - ${item}`)
  ].join("\n");
}

function rememberHtml(items, terms) {
  return `
    <div class="remember-box">
      <h3>Remember This</h3>
      <ul>${items.map((item) => `<li>✅ ${formatInline(item, terms)}</li>`).join("")}</ul>
    </div>
  `;
}

function buildCheatSheet(topicName, terms, keyPoints, definitions, steps, formulas) {
  return [
    `**Big Idea:** ${buildBigIdea(topicName, keyPoints)}`,
    `**Must-know terms:** ${terms.slice(0, 8).map(titleCase).join(", ") || "Add more readable source text."}`,
    `**Core process:** ${(steps[0] || keyPoints[0] || "Identify the main steps from the source.").replace(/\.$/, "")}.`,
    `**Top definition:** ${(definitions[0] || "No strong definition found yet.").replace(/\.$/, "")}.`,
    `**Formula/fact:** ${(formulas[0] || "No formula-like fact found in the uploaded files.").replace(/\.$/, "")}.`,
    `**Exam focus:** Explain causes, steps, definitions, differences, and common mistakes.`
  ];
}

function definitionForTerm(term, definitions, keyPoints) {
  const lower = term.toLowerCase();
  const match = definitions.find((line) => line.toLowerCase().includes(lower)) || keyPoints.find((line) => line.toLowerCase().includes(lower));
  return match ? cleanSentence(match) : `Important keyword from the uploaded material; revise its role and connection to the topic.`;
}

function formatInline(value, terms) {
  return strongMarkdownToHtml(boldKeywords(escapeHtml(value), terms));
}

function boldKeywords(value, terms) {
  let output = String(value);
  terms.slice(0, 10).forEach((term) => {
    const escapedTerm = escapeRegExp(term);
    output = output.replace(new RegExp(`\\b(${escapedTerm})\\b`, "gi"), "**$1**");
  });
  return output;
}

function strongMarkdownToHtml(value) {
  return String(value).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function uniqueLines(lines) {
  const seen = new Set();
  return lines.filter((line) => {
    const key = line.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getImportantTerms(text, limit) {
  const counts = new Map();
  const words = normalizeText(text)
    .toLowerCase()
    .match(/[a-z][a-z-]{3,}/g) || [];

  words.forEach((word) => {
    const clean = word.replace(/^-+|-+$/g, "");
    if (!stopWords.has(clean) && clean.length > 3) {
      counts.set(clean, (counts.get(clean) || 0) + 1);
    }
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

function splitSentences(text) {
  return normalizeText(text)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|[\r\n]+/)
    .map(cleanSentence)
    .filter(Boolean);
}

function cleanSentence(sentence) {
  return sentence
    .replace(/\s+/g, " ")
    .replace(/^[^A-Za-z0-9]+/, "")
    .trim();
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inferType(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".docx")) return "DOCX";
  if (name.endsWith(".doc")) return "DOC";
  if (name.endsWith(".txt") || name.endsWith(".md")) return "TXT";
  if (/\.(png|jpg|jpeg|webp|bmp|tif|tiff)$/i.test(name)) return "IMG";
  return "FILE";
}

function estimatePages(file, type) {
  if (type === "IMG" || type === "TXT") return 1;
  const mb = Math.max(1, Math.round(file.size / 700000));
  return Math.min(35, mb + (type === "PDF" ? 3 : 1));
}

function countWords(text) {
  const matches = normalizeText(text).match(/\b[\w'-]+\b/g);
  return matches ? matches.length : 0;
}

function typeClass(type) {
  return {
    PDF: "type-pdf",
    IMG: "type-img",
    DOC: "type-doc",
    DOCX: "type-doc",
    TXT: "type-txt",
    FILE: "type-txt"
  }[type] || "type-txt";
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function plural(count, label) {
  return count === 1 ? label : `${label}s`;
}

function readableError(error) {
  return error?.message || "Could not read this file.";
}

function cleanInput(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function initials(value) {
  const words = cleanInput(value).split(" ").filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "C";
}

function slugify(value) {
  return cleanInput(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `course-${Date.now()}`;
}

function uniqueCourseId(baseId) {
  let id = baseId;
  let index = 2;

  while (courses.some((course) => course.id === id)) {
    id = `${baseId}-${index}`;
    index += 1;
  }

  return id;
}

function waitForUi() {
  return new Promise((resolve) => setTimeout(resolve, 40));
}

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function setStatus(message) {
  processingStatus.textContent = message;
}

window.addEventListener("error", (event) => {
  setStatus(`Something went wrong: ${event.message}`);
});

window.addEventListener("unhandledrejection", (event) => {
  setStatus(`Import problem: ${readableError(event.reason)}`);
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function downloadNotes() {
  if (!latestNotesMarkdown.trim()) {
    setStatus("Generate notes first, then download.");
    return;
  }

  const blob = new Blob([latestNotesMarkdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentCourse().name} - ${currentTopic().name} Notes.md`.replace(/[\\/:*?"<>|]/g, "-");
  link.click();
  URL.revokeObjectURL(url);
}

async function copyNotes() {
  if (!latestNotesMarkdown.trim()) {
    setStatus("Generate notes first, then copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(latestNotesMarkdown);
    setStatus("Notes copied to clipboard.");
  } catch {
    setStatus("Clipboard is blocked. Use Download instead.");
  }
}

const stopWords = new Set([
  "about", "above", "after", "again", "also", "because", "before", "being", "between", "could", "during",
  "each", "from", "have", "into", "more", "most", "only", "other", "over", "same", "some", "such",
  "than", "that", "their", "them", "then", "there", "these", "they", "this", "through", "used", "using",
  "were", "what", "when", "where", "which", "while", "with", "would", "your", "page", "lecture", "notes"
]);

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  handleFiles(event.dataTransfer.files);
});

[browseButton, importButton].forEach((button) => {
  button.addEventListener("click", () => filePicker.click());
});

addCourseButton.addEventListener("click", addCourse);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    renderTabs();
  });
});

filePicker.addEventListener("change", (event) => {
  handleFiles(event.target.files);
  filePicker.value = "";
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderDocuments();
});

copyNotesButton.addEventListener("click", copyNotes);
downloadNotesButton.addEventListener("click", downloadNotes);

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelector("#planToggle").addEventListener("click", () => {
  roadmap.classList.toggle("open");
});

document.querySelector("#closePlan").addEventListener("click", () => {
  roadmap.classList.remove("open");
});

render();
setStatus("Ready. Drop a PDF, screenshot, DOCX, or text file.");
