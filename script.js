/**
 * ============================================
 * MediTranslate AI - JavaScript Application
 * ============================================
 * Description: Advanced medical document analysis and live voice translation system
 * Technologies: Google Gemini 3.1 Flash API, Web Speech API, Google Translate TTS
 * Author: MediTranslate Team
 * ============================================
 */

// --- 1. CONFIGURATION & API SETUP ---
const API_KEY = "PASTE_YOUR_API_KEY_HERE"; // PASTE YOUR GEMINI API KEY HERE
const MODEL = "gemini-3.1-flash-lite-preview"; 
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// --- 2. DOM ELEMENT SELECTORS ---
const reportUpload = document.getElementById('reportUpload');      
const dropzone = document.getElementById('reportDropzone');          
const fileNameDisplay = document.getElementById('fileNameDisplay');    
const languageSelect = document.getElementById('languageSelect');     
const translateBtn = document.getElementById('translateBtn');          
const speakBtn = document.getElementById('speakBtn');                  
const statusMessage = document.getElementById('statusMessage');        
const translatedOutput = document.getElementById('translatedOutput');  

// --- 3. GLOBAL STATE VARIABLES ---
let audioScript = "";      // Stores the short summary for text-to-speech
let currentAudio = null;   // Audio object reference for playback control

// --- 4. FILE UPLOAD & DRAG-AND-DROP FUNCTIONALITY ---
dropzone.addEventListener('click', () => reportUpload.click());

reportUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFileStatus(e.target.files[0]);
    }
});

['dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();    
        e.stopPropagation();   
    });
});

dropzone.addEventListener('dragover', () => {
    dropzone.style.borderColor = '#2563eb';
    dropzone.style.backgroundColor = '#f0f7ff';
});

dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '#cbd5e1';
    dropzone.style.backgroundColor = '#fbfcfe';
});

dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        reportUpload.files = files;  
        handleFileStatus(files[0]);
    }
});

function handleFileStatus(file) {
    fileNameDisplay.innerHTML = ` File: ${file.name}`;
    dropzone.classList.add('file-set');
    dropzone.style.borderColor = '#10b981';
    statusMessage.innerHTML = "📎 File attached. Ready for analysis.";
}

async function fileToB64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);  
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);  
    });
}

// --- 5. VOICE RECOGNITION (Web Speech API) ---
const recordBtn = document.getElementById('recordBtn');
const recordText = document.getElementById('recordText');
const liveTranscript = document.getElementById('liveTranscript');

let isRecording = false;
let finalTranscript = "";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;      
    recognition.interimResults = true;  
    recognition.lang = 'en-US';         

    recognition.onstart = () => {
        isRecording = true;
        recordBtn.classList.add('recording');
        recordText.innerText = "Listening... Click to Stop";
        statusMessage.innerHTML = "🎤 Recording doctor's consultation...";
    };

    recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript;
            }
        }
        liveTranscript.innerHTML = `<strong>Transcript:</strong> ${finalTranscript} <br> <i style="color:#94a3b8">${interimTranscript}</i>`;
    };

    recognition.onend = () => {
        if (isRecording) recognition.start(); 
    };
} else {
    recordBtn.disabled = true;
    recordText.innerText = "Voice API Not Supported in Browser";
}

function stopRecording() {
    isRecording = false;
    recognition.stop();
    recordBtn.classList.remove('recording');
    recordText.innerText = "Start Recording Doctor";
    statusMessage.innerHTML = "✅ Audio captured. Ready to analyze.";
}

recordBtn.addEventListener('click', () => {
    if (!isRecording) {
        finalTranscript = ""; 
        liveTranscript.innerHTML = "Listening...";
        recognition.start();
    } else {
        stopRecording();
    }
});


// --- 6. GEMINI 3.1 AI TRANSLATION ENGINE ---
translateBtn.addEventListener('click', async () => {
    const file = reportUpload.files[0];
    const langName = languageSelect.options[languageSelect.selectedIndex].text;
    
    if (!file && finalTranscript.trim() === "") {
        return alert("Please upload a medical report OR record a voice consultation!");
    }
    if (API_KEY.includes("PASTE_YOUR_KEY")) return alert("Please enter your API Key in script.js");

    translateBtn.disabled = true;
    statusMessage.innerHTML = "🤖 Gemini 3.1 is analyzing your data...";
    translatedOutput.innerHTML = "Generating translation and summary... please wait.";

    try {
        let prompt = "";
        let apiBody = {};

        // SCENARIO 1: Both Image and Voice are provided
        if (file && finalTranscript.trim() !== "") {
            const b64 = await fileToB64(file);
            prompt = `Analyze this medical report image AND the following transcript of the doctor's verbal advice: "${finalTranscript}". 
            1. Provide a comprehensive summary of BOTH combining the report details and the doctor's advice in ${langName}. 
            2. Provide a 1-sentence simple summary in ${langName} for the patient. 
            Return ONLY a JSON object: {"full": "...", "short": "..."}. Do not use markdown tags.`;
            
            apiBody = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type, data: b64 } }] }] };
        } 
        // SCENARIO 2: Only Image is provided
        else if (file) {
            const b64 = await fileToB64(file);
            prompt = `Analyze this medical report. 
            1. Provide a COMPLETE translation into ${langName}. 
            2. Provide a separate 1-sentence simple summary in ${langName} for the patient. 
            Return ONLY a JSON object: {"full": "...", "short": "..."}. Do not use markdown tags.`;
            
            apiBody = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type, data: b64 } }] }] };
        } 
        // SCENARIO 3: Only Voice is provided
        else {
            prompt = `Analyze the following transcript of a doctor's consultation: "${finalTranscript}".
            1. Translate and summarize the doctor's advice in ${langName}.
            2. Provide a separate 1-sentence simple summary in ${langName} for the patient to listen to.
            Return ONLY a JSON object: {"full": "...", "short": "..."}. Do not use markdown tags.`;
            
            apiBody = { contents: [{ parts: [{ text: prompt }] }] };
        }

        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiBody)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]) {
            const rawText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
            const result = JSON.parse(rawText);

            translatedOutput.innerHTML = `<strong>Consultation Details:</strong><br><br>${result.full.replace(/\n/g, '<br>')}`;
            audioScript = result.short; 
            
            statusMessage.innerHTML = "✅ Success! Click 'Speak Summary' to listen.";
            speakBtn.disabled = false;
        } else {
            throw new Error(data.error ? data.error.message : "AI could not process this request.");
        }

    } catch (err) {
        console.error(err);
        statusMessage.innerHTML = "❌ Analysis failed.";
        translatedOutput.innerHTML = "Error: " + err.message;
    } finally {
        translateBtn.disabled = false;
    }
});

// --- 7. TEXT-TO-SPEECH FUNCTIONALITY (Google Translate TTS) ---
speakBtn.addEventListener('click', () => {
    if (!audioScript) return alert("No translation available to read!");
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    const baseLangCode = languageSelect.value.split('-')[0];
    const cloudTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(audioScript)}&tl=${baseLangCode}&client=tw-ob`;
    
    currentAudio = new Audio(cloudTtsUrl);
    currentAudio.onplay = () => statusMessage.innerHTML = `🔊 Streaming Audio in ${languageSelect.options[languageSelect.selectedIndex].text}...`;
    currentAudio.onended = () => statusMessage.innerHTML = "✅ Audio finished.";
    currentAudio.onerror = () => statusMessage.innerHTML = "❌ Network error. Could not load cloud audio.";
    
    currentAudio.play().catch(err => {
        console.error("Playback blocked:", err);
        statusMessage.innerHTML = "❌ Browser blocked playback. Click Speak again.";
    });
});