# MediVoice: Multilingual AI Medical Translator & Summarizer

![AI](https://img.shields.io/badge/AI-NLP%20%26%20LLMs-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge)
![Domain](https://img.shields.io/badge/Domain-HealthTech-green?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages-brightgreen?style=for-the-badge)

**👉 [Click here to view the live website!](Insert Your Live Link Here)**

## 📋 Project Overview
MediVoice is an AI-driven healthcare assistant designed to bridge the communication gap between medical professionals and patients. The system leverages real-time voice processing and Natural Language Processing (NLP) to translate medical documents and live consultations, generating easily digestible, translated summaries of the doctor's advice for the patient.

## ⚙️ Core Architecture & API Pipeline
The system utilizes a fully client-side API chain to process real-time audio and deliver localized summaries:
1. **Audio Capture (Speech-to-Text):** Utilizes the browser's native Web Speech API to transcribe live medical consultations.
2. **AI Summarization (NLP):** Integrates the Google Gemini 3.1 Flash API to process raw transcripts and uploaded medical reports, extracting key takeaways like prescriptions and dosage instructions.
3. **Multilingual Translation:** Dynamically translates the summarized text into the patient's selected regional language.
4. **Patient Delivery (Text-to-Speech):** Delivers the summarized, localized advice back to the patient via Google Cloud Translation TTS audio readout.

## 🤖 Development Approach: AI-Assisted Rapid Prototyping
As an engineer focused on backend logic and API integration, my goal for this project was to rapidly prototype a functional HealthTech tool. To accelerate the frontend development, I utilized advanced AI tools to generate the core HTML, CSS, and UI JavaScript.

This resourceful approach allowed me to focus my engineering efforts on the complex system architecture:
* **Prompt Engineering:** Structuring the precise prompts required to make the Gemini API accurately summarize and translate medical jargon.
* **API Chaining:** Successfully linking the browser's native Web Speech API (STT) with Google's Gemini LLM and Cloud Translation TTS into one seamless, real-time data pipeline.
