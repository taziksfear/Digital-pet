import os
import json
import wave
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from vosk import Model, KaldiRecognizer
import requests
from pydub import AudioSegment

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Разрешаем CORS для всех источников
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Конфигурация
VOSK_MODEL_PATH = "vosk-model-small-ru-0.22"  # путь к модели Vosk
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gpt-oss:120b-cloud"
SYSTEM_PROMPT = "Ты – милый виртуальный питомец. Отвечай коротко, дружелюбно, иногда игриво. Ответ должен быть не длиннее 200 символов."

# Загружаем модель Vosk (один раз при старте)
if not os.path.exists(VOSK_MODEL_PATH):
    raise Exception(f"Vosk model not found at {VOSK_MODEL_PATH}")
model = Model(VOSK_MODEL_PATH)

def convert_to_wav(input_path: str, output_path: str):
    """Конвертирует аудио в WAV 16kHz mono с помощью pydub."""
    try:
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)  # 16-bit
        audio.export(output_path, format="wav")
        logger.info(f"Converted {input_path} to {output_path}")
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        raise

def transcribe_audio(file_path: str) -> str:
    """Распознаёт речь из аудиофайла (WAV, 16kHz, mono)."""
    wf = wave.open(file_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(False)
    
    text = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            text += res.get("text", "") + " "
    # Финальный результат
    res = json.loads(rec.FinalResult())
    text += res.get("text", "")
    return text.strip()

def ask_ollama(prompt: str) -> str:
    """Отправляет запрос в Ollama и возвращает ответ."""
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": f"{SYSTEM_PROMPT}\n\nПользователь: {prompt}\nПитомец:",
        "stream": False
    }
    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

@app.post("/api/voice/process")
async def process_voice(file: UploadFile = File(...)):
    # Сохраняем загруженный файл временно
    temp_input = f"/tmp/input_{file.filename}"
    temp_wav = f"/tmp/converted_{file.filename}.wav"
    
    try:
        # Сохраняем полученный файл
        with open(temp_input, "wb") as f:
            f.write(await file.read())
        logger.info(f"Saved uploaded file to {temp_input}, size: {os.path.getsize(temp_input)} bytes")
        
        # Конвертируем в WAV
        convert_to_wav(temp_input, temp_wav)
        
        # Распознаём речь
        text = transcribe_audio(temp_wav)
        if not text:
            logger.warning("No speech detected")
            return JSONResponse(content={"error": "No speech detected"}, status_code=400)
        
        logger.info(f"Transcribed text: {text}")
        
        # Получаем ответ от Ollama
        answer = ask_ollama(text)
        logger.info(f"Ollama answer: {answer}")
        
        return {"text": text, "answer": answer}
    
    except Exception as e:
        logger.error(f"Error processing voice: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Удаляем временные файлы
        for path in [temp_input, temp_wav]:
            if os.path.exists(path):
                os.remove(path)
                logger.info(f"Removed temporary file: {path}")