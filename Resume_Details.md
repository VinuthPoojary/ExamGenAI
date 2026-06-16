# ExamGen AI Pro - Resume Details & Interview Guide

This document contains professionally crafted resume bullet points, technology stack descriptions, architectural overviews, and interview preparation guides for the **ExamGen AI Pro** project.

---

## 1. Resume Entry: Short & High-Impact (One-Line Format)
**ExamGen AI Pro** | *Full Stack & AI Integration Engineer* | Node.js, React 19, MongoDB, Google Gemini API, SSE
* Architected a full-stack AI-powered test generation and evaluation system, enabling students to upload PDF learning materials and automatically generate customized examinations (MCQs, scenario-based case studies, essays).
* Engineered a real-time answer grading pipeline utilizing Google Gemini 2.5 Flash API with structured JSON output, grading free-text submissions and providing constructive, automated learning suggestions.
* Built a web-security proctoring sandbox in React utilizing HTML5 Fullscreen and Page Visibility APIs to capture and log exam violations (tab switches, focus loss) with zero performance overhead.
* Implemented real-time asynchronous notifications using Server-Sent Events (SSE) and automated emails with Nodemailer.
* Created a performance analytics dashboard with Chart.js and React ChartJS 2 to track progress, difficulty breakdowns, and topic mastery.

---

## 2. Professional Resume Details (Detailed Section)

### Technical Stack
* **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, Axios, Chart.js, React ChartJS 2, Lucide React, HTML5 Fullscreen & Page Visibility APIs.
* **Backend**: Node.js, Express.js, MongoDB, Mongoose ODM, Server-Sent Events (SSE), Multer, pdf-parse, JWT (JSON Web Tokens), Bcrypt.js, Nodemailer.
* **AI/LLM**: Google Gemini 2.5 Flash API (Structured JSON response configuration, dynamic context pruning, systemInstructions for multi-turn tutoring chat).

### Core Accomplishments & Bullet Points

1. **AI Question Generation Engine**
   * Designed a server-side ingestion service that cleans and prunes PDF-extracted text (using `pdf-parse` up to 40K characters) and interfaces with the **Google Gemini 2.5 Flash API** using `responseMimeType: "application/json"` to generate balanced, highly specific academic assessments.
   * Standardized Schema definitions supporting multiple question formats including Single-Option Multiple Choice (MCQ), Short Answer, Essay/Long Answer, and complex Scenario-Based Case Studies (narratives containing nested MCQ/short sub-questions).

2. **Automated Descriptive Grading Pipeline**
   * Engineered an asynchronous batch evaluation pipeline that compares student text submissions against AI-generated model answers, computing granular marking allocations and assessing conceptual completeness.
   * Developed a grading recovery fallback mechanism to prevent client timeouts and API rate-limiting errors by gracefully handling connection drops and resuming state.

3. **Secure Proctoring Sandbox & Focus Tracker**
   * Programmed an active proctoring interface enforcing secure exam modes via browser-level events. Utilized `visibilitychange` listeners and Fullscreen API state trackers to intercept unauthorized tab changes, window blurs, and exit events.
   * Constructed a relational infraction logger that persists violations, calculates suspicion index ratings (low, medium, high), and updates user exam dashboards.

4. **Real-time SSE Notification Infrastructure**
   * Replaced polling protocols with **Server-Sent Events (SSE)**, registering active HTTP response streams to push instant grading reports and document-processing completions directly to frontend clients.

5. **Performance Metrics Analytics**
   * Created a visual learning dashboard using **Chart.js** to map student performance metrics over time, aggregate subject-level grade distributions, and map topic weaknesses onto a spider/radar chart to guide revision.

---

## 3. How to Talk About This Project in an Interview

### The 30-Second Elevator Pitch
> *"I developed **ExamGen AI Pro**, a full-stack, AI-powered learning and evaluation platform built on React 19, Node.js, and MongoDB. The system allows users to upload study guides or textbooks as PDFs, automatically extract topics, and generate custom practice exams ranging from MCQs to multi-part scenario case studies using the Gemini 2.5 Flash API. What makes it unique is the automated grading pipeline, which evaluates descriptive text submissions against model answers in real-time, and a secure proctoring environment that enforces fullscreen modes and tab-switch detection to prevent cheating. I also built a metrics dashboard using Chart.js to help students identify their weak spots and visual learning progress."*

### Key System Design & Technical Questions You Might Be Asked

#### Q1: "How did you ensure the Gemini API returned valid JSON structure that doesn't crash your backend parser?"
* **Answer**: *"Instead of relying on regex or loose string parsing, I used Gemini’s native JSON schema configuration by setting `responseMimeType: "application/json"` inside the `generationConfig` options. I also designed a strict system prompt explaining the exact JSON shape. If the JSON structure misses required fields, I added a backend validation check that catches the error before database persistence and prompts a safe retry or fallback."*

#### Q2: "Why did you choose Server-Sent Events (SSE) instead of WebSockets for real-time notifications?"
* **Answer**: *"For notifications, communication is unidirectional (server-to-client). WebSockets introduce extra protocol overhead, require handshakes, and need specialized hosting packages. SSE operates over standard HTTP, supports automatic reconnection out of the box, and is lightweight to implement in Node/Express using standard write headers. This made it the perfect fit for pushing background PDF extraction and grading completions."*

#### Q3: "What were some performance concerns when uploading and processing large PDFs, and how did you mitigate them?"
* **Answer**: *"Parsing raw text from massive PDF files can block the Node.js event loop and consume massive API tokens. I addressed this on two fronts: First, I configured `multer` to store documents on disk, and used `pdf-parse` to extract text. Second, I implemented context-cleansing and string slicing (capping the context to 40,000 characters) to fit safely within LLM context windows while maintaining core subject content."*

#### Q4: "How does the proctoring feature work on the client side?"
* **Answer**: *"It uses a combination of modern browser APIs. When a student starts an exam, they are forced to enter Fullscreen mode using the `requestFullscreen` API. I then attach event listeners to `visibilitychange` (using the Page Visibility API) and `fullscreenchange`. If they switch tabs, open another window, or exit fullscreen, an event fires, increments their infraction counter, flags the attempt, and opens a warning modal. The final score submission includes this violation log to compute an overall suspicion level."*
