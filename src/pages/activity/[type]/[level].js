import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageBox from '../../../components/MessageBox';
import { BookOpen, Edit3, RefreshCw, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';

async function fetchContentFromAI(category, levelFromUrl, mode) {
  let effectiveLevel = levelFromUrl; 

  const lowerCaseCategory = String(category).toLowerCase();
  if (['slang', 'hood', 'idioms'].includes(lowerCaseCategory)) {
    effectiveLevel = 'advanced';
  }

  console.log(`Meminta konten AI untuk: Kategori=${category}, Level (URL)=${levelFromUrl}, Level (Efektif untuk AI)=${effectiveLevel}, Mode=${mode}`);
  
  let promptText = "";
  let responseSchema = {};

  if (mode === 'vocabulary') {
    promptText = `Generate a list of 5 English vocabulary words for ${effectiveLevel} ${category} learners. For each word, provide its meaning in Indonesian and an example sentence in English.`;
    responseSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          "word": { "type": "STRING", "description": "The vocabulary word." },
          "meaning": { "type": "STRING", "description": "The meaning of the word in Indonesian." },
          "example": { "type": "STRING", "description": "An example sentence using the word." }
        },
        "required": ["word", "meaning", "example"]
      }
    };
  } else if (mode === 'exercises') {
    promptText = `Create 3 multiple-choice questions for ${effectiveLevel} ${category} English learners. Each question should test vocabulary or grammar related to ${category}. Provide 4 options (A, B, C, D) and indicate the correct answer (A, B, C, or D) and a brief explanation in Indonesian.`;
    if (lowerCaseCategory === 'idioms') {
        promptText = `Create 3 multiple-choice questions for ${effectiveLevel} English learners specifically about understanding and using English idioms. Provide 4 options (A, B, C, D), the correct answer (A, B, C, or D), and a brief explanation in Indonesian.`;
    } else if (lowerCaseCategory === 'slang') {
        promptText = `Create 3 multiple-choice questions for ${effectiveLevel} English learners specifically about understanding and using English slang terms. Provide 4 options (A, B, C, D), the correct answer (A, B, C, or D), and a brief explanation in Indonesian.`;
    } else if (lowerCaseCategory === 'hood') {
        promptText = `Create 3 multiple-choice questions for ${effectiveLevel} English learners specifically about understanding and using English 'hood' language terms or expressions. Provide 4 options (A, B, C, D), the correct answer (A, B, C, or D), and a brief explanation in Indonesian.`;
    }
    
    responseSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          "question": { "type": "STRING", "description": "The question text." },
          "options": {
            "type": "OBJECT",
            "properties": {
                "A": { "type": "STRING" },
                "B": { "type": "STRING" },
                "C": { "type": "STRING" },
                "D": { "type": "STRING" }
            },
            "required": ["A", "B", "C", "D"]
          },
          "correctAnswer": { "type": "STRING", "description": "The letter of the correct option (e.g., 'A', 'B')." },
          "explanation": { "type": "STRING", "description": "A brief explanation for the answer in Indonesian."}
        },
        "required": ["question", "options", "correctAnswer", "explanation"]
      }
    };
  }

  const chatHistory = [{ role: "user", parts: [{ text: promptText }] }];
  const payload = {
    contents: chatHistory,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "Gagal mengambil detail error dari API" }}));
        console.error("API Error Response:", errorData);
        throw new Error(`Permintaan API gagal dengan status ${response.status}: ${errorData.error?.message || 'Error tidak diketahui dari API.'}`);
    }
    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const rawJson = result.candidates[0].content.parts[0].text;
      try {
        const parsedJson = JSON.parse(rawJson);
        return parsedJson;
      } catch (e) {
        console.error("Gagal memparsing JSON dari respons AI:", rawJson, e);
        throw new Error("AI mengembalikan JSON yang tidak valid.");
      }
    } else {
      console.error("Struktur respons AI tidak terduga:", result);
      throw new Error("Respons AI kosong atau tidak valid.");
    }
  } catch (error) {
    console.error("Error saat mengambil konten dari AI:", error);
    throw error; 
  }
}

export default function ActivityPage() {
  const router = useRouter();
  const { type, level } = router.query; 

  const [currentMode, setCurrentMode] = useState(null);
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleFetchContent = async (mode) => {
    if (!type || !level) { 
        setError("Tipe atau level aktivitas tidak valid untuk memuat konten.");
        return;
    }
    setCurrentMode(mode);
    setIsLoading(true);
    setError(null);
    setContent([]);
    setUserAnswers({});
    setShowResults(false);
    try {
      const aiContent = await fetchContentFromAI(String(type), String(level), mode);
      setContent(aiContent);
    } catch (err) {
      setError(err.message || 'Gagal memuat konten dari AI. Silakan coba lagi.');
    }
    setIsLoading(false);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitExercises = () => {
    setShowResults(true);
  };
  
  const pageTitle = `${level ? String(level).charAt(0).toUpperCase() + String(level).slice(1) : 'Umum'} ${type ? String(type).charAt(0).toUpperCase() + String(type).slice(1) : 'Aktivitas'}`;
  const backPath = type === 'casual' ? '/casual' : '/';

  if (router.isFallback || !router.isReady) {
    return <LoadingSpinner />; 
  }
  
  if (!type || !level) {
      return (
          <div className="text-center">
              <MessageBox message="Parameter halaman tidak lengkap. Tidak dapat memuat aktivitas." type="error" />
              <Link href={backPath} className="mt-4 text-sky-400 hover:text-sky-300 inline-flex items-center">
                  <ChevronLeft size={20} className="mr-1" /> Kembali
              </Link>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-800 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-sky-400 mb-2">Aktivitas Belajar: {pageTitle}</h1>
        <p className="text-slate-300">Pilih mode belajar di bawah ini.</p>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <button
          onClick={() => handleFetchContent('vocabulary')}
          disabled={isLoading}
          className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all
            ${currentMode === 'vocabulary' ? 'bg-sky-500 text-white ring-2 ring-sky-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <BookOpen size={20} className="mr-2" /> Belajar Kosakata
        </button>
        <button
          onClick={() => handleFetchContent('exercises')}
          disabled={isLoading}
          className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all
            ${currentMode === 'exercises' ? 'bg-teal-500 text-white ring-2 ring-teal-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Edit3 size={20} className="mr-2" /> Latihan Soal
        </button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <MessageBox message={error} type="error" />}

      {!isLoading && !error && content && content.length > 0 && (
        <div className="p-4 sm:p-6 bg-slate-800 rounded-xl shadow-xl mt-6">
          {currentMode === 'vocabulary' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-sky-300 mb-4">Kosakata Baru:</h2>
              {content.map((item, index) => (
                <div key={index} className="p-4 bg-slate-700 rounded-lg shadow">
                  <h3 className="text-xl font-bold text-sky-400">{item.word}</h3>
                  <p className="text-slate-300"><strong className="text-slate-100">Arti:</strong> {item.meaning}</p>
                  <p className="text-slate-300"><strong className="text-slate-100">Contoh:</strong> "{item.example}"</p>
                </div>
              ))}
            </div>
          )}

          {currentMode === 'exercises' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-teal-300 mb-4">Latihan Soal:</h2>
              {content.map((item, qIndex) => (
                <div key={qIndex} className="p-4 bg-slate-700 rounded-lg shadow">
                  <p className="text-lg font-medium text-slate-100 mb-3">{qIndex + 1}. {item.question}</p>
                  <div className="space-y-2">
                    {Object.entries(item.options).map(([optionKey, optionText]) => (
                      <label key={optionKey} className={`block p-3 rounded-md transition-colors cursor-pointer border-2
                        ${showResults 
                          ? (optionKey === item.correctAnswer ? 'bg-green-600 border-green-500 text-white' : (userAnswers[qIndex] === optionKey ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-600 border-slate-500 text-slate-200'))
                          : (userAnswers[qIndex] === optionKey ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-600 hover:bg-slate-500 border-slate-500 text-slate-200')
                        } `}>
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={optionKey}
                          checked={userAnswers[qIndex] === optionKey}
                          onChange={() => !showResults && handleAnswerChange(qIndex, optionKey)}
                          disabled={showResults}
                          className="mr-3 opacity-0 w-0 h-0 absolute"
                        />
                        <span className="text-base">{optionKey}. {optionText}</span>
                        {showResults && optionKey === item.correctAnswer && <CheckCircle size={20} className="inline ml-2 text-white float-right" />}
                        {showResults && userAnswers[qIndex] === optionKey && optionKey !== item.correctAnswer && <XCircle size={20} className="inline ml-2 text-white float-right" />}
                      </label>
                    ))}
                  </div>
                  {showResults && (
                    <div className={`mt-3 p-3 rounded-md text-sm ${item.correctAnswer === userAnswers[qIndex] ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                      <p className="font-semibold">Jawaban yang Benar: {item.correctAnswer}. {item.options[item.correctAnswer]}</p>
                      <p>Penjelasan: {item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
              {!showResults && content.length > 0 && (
                <button
                  onClick={handleSubmitExercises}
                  className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Kumpulkan Jawaban
                </button>
              )}
              {showResults && (
                 <button
                  onClick={() => handleFetchContent('exercises')}
                  className="mt-4 w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <RefreshCw size={18} className="mr-2"/> Coba Lagi Latihan Ini
                </button>
              )}
            </div>
          )}
           {!isLoading && content.length > 0 && (
             <button
                onClick={() => handleFetchContent(currentMode)}
                disabled={isLoading}
                className="mt-8 w-full bg-slate-600 hover:bg-slate-500 text-sky-300 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <RefreshCw size={18} className="mr-2"/> Muat Konten Baru ({currentMode === 'vocabulary' ? 'Kosakata' : 'Soal'})
              </button>
           )}
        </div>
      )}
      <div className="mt-8">
        <Link href={backPath} className="text-sky-400 hover:text-sky-300 inline-flex items-center">
          <ChevronLeft size={20} className="mr-1" /> Kembali
        </Link>
      </div>
    </div>
  );
}
