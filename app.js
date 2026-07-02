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
          doc("Lecture 8 - glycolysis.pdf", "PDF", 14, 8240, "10:24 AM", "Canvas", "High"),
          doc("whiteboard-cycle.jpg", "IMG", 2, 1260, "Yesterday", "Camera Roll", "Medium"),
          doc("ATP notes rough.txt", "TXT", 3, 1810, "Yesterday", "Typed note", "High"),
          doc("mitochondria review.docx", "DOC", 8, 3940, "Mon", "OneDrive", "High"),
          doc("lab-prep-fermentation.pdf", "PDF", 6, 3210, "Mon", "Downloads", "High"),
          doc("quiz-missed-questions.png", "IMG", 1, 760, "Jun 19", "Screenshot", "Medium"),
          doc("krebs-cycle-table.docx", "DOC", 5, 2770, "Jun 18", "OneDrive", "High"),
          doc("chapter-7-annotations.pdf", "PDF", 5, 1681, "Jun 17", "iPad", "High")
        ]
      },
      {
        id: "genetics",
        name: "Mendelian Genetics",
        docs: [
          doc("Punnett square recap.pdf", "PDF", 9, 4430, "Jun 15", "Canvas", "High"),
          doc("genetics worksheet answers.docx", "DOC", 4, 2200, "Jun 14", "Downloads", "Medium")
        ]
      }
    ]
  },
  {
    id: "math",
    name: "Linear Algebra",
    term: "Summer 2026",
    icon: "Σ",
    topics: [
      {
        id: "eigen",
        name: "Eigenvectors",
        docs: [
          doc("eigenvectors lecture.pdf", "PDF", 12, 5820, "Today", "Canvas", "High"),
          doc("matrix notes.txt", "TXT", 2, 930, "Yesterday", "Typed note", "High")
        ]
      },
      {
        id: "basis",
        name: "Basis & Span",
        docs: [doc("span examples.png", "IMG", 1, 620, "Jun 16", "Screenshot", "Medium")]
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
        docs: [
          doc("containment policy.pdf", "PDF", 7, 3410, "Jun 12", "Canvas", "High"),
          doc("timeline rough notes.txt", "TXT", 3, 1450, "Jun 11", "Typed note", "High")
        ]
      }
    ]
  },
  {
    id: "chem",
    name: "Organic Chemistry",
    term: "Spring 2026",
    icon: "CH",
    topics: [
      {
        id: "alkenes",
        name: "Alkenes",
        docs: [doc("reaction mechanisms.pdf", "PDF", 11, 4880, "Jun 10", "Downloads", "Medium")]
      }
    ]
  }
];

let selectedCourseId = "bio";
let selectedTopicId = "cell";
let selectedDocId = courses[0].topics[0].docs[0].id;
let searchTerm = "";

const courseList = document.querySelector("#courseList");
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

function doc(name, type, pages, words, added, source, quality) {
  return {
    id: `${name}-${Math.random().toString(36).slice(2)}`,
    name,
    type,
    pages,
    words,
    added,
    source,
    quality
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
    return [item.name, item.type, item.source, currentTopic().name, currentCourse().name]
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
}

function renderCourses() {
  courseList.innerHTML = "";

  courses.forEach((course) => {
    const count = course.topics.reduce((total, topic) => total + topic.docs.length, 0);
    const button = document.createElement("button");
    button.className = `course-item${course.id === selectedCourseId ? " active" : ""}`;
    button.innerHTML = `
      <span class="course-icon">${course.icon}</span>
      <span class="course-copy">
        <strong>${course.name}</strong>
        <span>${course.topics.length} topics · ${count} docs</span>
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
          <span class="doc-file-icon ${typeClass(item.type)}">${item.type}</span>
          <span class="name-stack">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${currentTopic().name}</span>
          </span>
        </button>
      </td>
      <td>${item.type}</td>
      <td>${item.pages}</td>
      <td>${item.words.toLocaleString()}</td>
      <td>${item.added}</td>
      <td><span class="source-pill">${item.source}</span></td>
      <td><button class="row-actions" aria-label="More actions">...</button></td>
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
    : `Showing 1-${docs.length} of ${total} ${plural(total, "document")}`;
}

function renderDetails() {
  const docs = currentTopic().docs;
  const selected = docs.find((item) => item.id === selectedDocId) ?? docs[0];

  if (!selected) {
    detailCard.innerHTML = `
      <div class="doc-preview"><span class="type-txt">NEW</span></div>
      <h3>No document selected</h3>
      <p>Import a file to start organizing this topic.</p>
    `;
    mergeSummary.innerHTML = "<li>Waiting for the first document.</li>";
    return;
  }

  detailCard.innerHTML = `
    <div class="doc-preview"><span class="${typeClass(selected.type)}">${selected.type}</span></div>
    <h3>${escapeHtml(selected.name)}</h3>
    <p>Cleaned, indexed, and attached to ${currentTopic().name}.</p>
    <div class="detail-grid">
      <div><span>Course</span><strong>${currentCourse().name}</strong></div>
      <div><span>Topic</span><strong>${currentTopic().name}</strong></div>
      <div><span>Type</span><strong>${selected.type}</strong></div>
      <div><span>Pages</span><strong>${selected.pages}</strong></div>
      <div><span>Words</span><strong>${selected.words.toLocaleString()}</strong></div>
      <div><span>Quality</span><strong><span class="quality-pill">${selected.quality}</span></strong></div>
    </div>
  `;

  mergeSummary.innerHTML = [
    `${docs.length} source files grouped into ${currentTopic().name}.`,
    `${docs.reduce((total, item) => total + item.words, 0).toLocaleString()} searchable words indexed.`,
    "Duplicate headings and repeated screenshots flagged for review."
  ]
    .map((line) => `<li>${line}</li>`)
    .join("");
}

function handleFiles(fileList) {
  const topic = currentTopic();
  Array.from(fileList).forEach((file) => {
    const type = inferType(file);
    const pages = estimatePages(file, type);
    const words = estimateWords(file, type, pages);
    topic.docs.unshift(doc(file.name, type, pages, words, "Just now", "Imported", "Pending"));
  });
  selectedDocId = topic.docs[0]?.id ?? selectedDocId;
  render();
}

function inferType(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "DOC";
  if (name.endsWith(".txt") || name.endsWith(".md")) return "TXT";
  return "IMG";
}

function estimatePages(file, type) {
  if (type === "IMG") return 1;
  const mb = Math.max(1, Math.round(file.size / 700000));
  return Math.min(28, mb + (type === "PDF" ? 3 : 1));
}

function estimateWords(file, type, pages) {
  const density = type === "IMG" ? 430 : type === "TXT" ? 520 : 680;
  return Math.round(pages * density + file.name.length * 17);
}

function typeClass(type) {
  return {
    PDF: "type-pdf",
    IMG: "type-img",
    DOC: "type-doc",
    TXT: "type-txt"
  }[type];
}

function plural(count, label) {
  return count === 1 ? label : `${label}s`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

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

filePicker.addEventListener("change", (event) => {
  handleFiles(event.target.files);
  filePicker.value = "";
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderDocuments();
});

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
