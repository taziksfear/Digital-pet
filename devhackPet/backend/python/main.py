import os
import json
import wave
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
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
VOSK_MODEL_PATH = "vosk-model-small-ru-0.22"
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gpt-oss:120b-cloud"
BASE_SYSTEM_PROMPT = "Ты – милый виртуальный питомец. Отвечай коротко, дружелюбно, иногда игриво. Ответ должен быть не длиннее 200 символов."

if not os.path.exists(VOSK_MODEL_PATH):
    raise Exception(f"Vosk model not found at {VOSK_MODEL_PATH}")
model = Model(VOSK_MODEL_PATH)

def convert_to_wav(input_path: str, output_path: str):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_path, format="wav")
    logger.info(f"Converted {input_path} to {output_path}")

def transcribe_audio(file_path: str) -> str:
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
    res = json.loads(rec.FinalResult())
    text += res.get("text", "")
    return text.strip()

def ask_ollama(prompt: str, system_extra: str = "") -> str:
    full_system = BASE_SYSTEM_PROMPT
    if system_extra:
        full_system += " " + system_extra
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": f"{full_system}\n\nПользователь: {prompt}\nПитомец:",
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
async def process_voice(
    file: UploadFile = File(...),
    pet_name: str = Form(""),
    pet_character: str = Form(""),
    pet_stats: str = Form(""),
    weather: str = Form("")  # <-- добавлено
):
    temp_input = f"/tmp/input_{file.filename}"
    temp_wav = f"/tmp/converted_{file.filename}.wav"
    
    try:
        with open(temp_input, "wb") as f:
            f.write(await file.read())
        logger.info(f"Saved uploaded file to {temp_input}")
        
        convert_to_wav(temp_input, temp_wav)
        text = transcribe_audio(temp_wav)
        if not text:
            logger.warning("No speech detected")
            return JSONResponse(content={"error": "No speech detected"}, status_code=400)
        
        logger.info(f"Transcribed text: {text}")
        
        # Формируем дополнительный контекст о питомце и погоде
        context_parts = []
        if pet_name:
            context_parts.append(f"Тебя зовут {pet_name}.")
        if pet_character:
            context_parts.append(f"Ты сейчас выглядишь как {pet_character}.")
        if pet_stats:
            context_parts.append(f"Твоё состояние: {pet_stats}")
        if weather:
            weather_desc = ""
            if weather == "rn":
                weather_desc = "На улице идёт дождь."
            elif weather == "snw":
                weather_desc = "На улице идёт снег."
            else:
                weather_desc = "На улице ясно."
            context_parts.append(weather_desc)
        
        system_extra = " ".join(context_parts)
        answer = ask_ollama(text, system_extra)
        logger.info(f"Ollama answer: {answer}")
        
        return {"text": text, "answer": answer}
    
    except Exception as e:
        logger.error(f"Error processing voice: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        for path in [temp_input, temp_wav]:
            if os.path.exists(path):
                os.remove(path)
                logger.info(f"Removed temporary file: {path}")

@app.post("/api/ai/generate")
async def generate_text(request: dict):
    prompt = request.get("prompt")
    pet_name = request.get("pet_name", "")
    pet_character = request.get("pet_character", "")
    pet_stats = request.get("pet_stats", "")
    weather = request.get("weather", "")  # <-- добавлено
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing 'prompt' field")
    
    context_parts = []
    if pet_name:
        context_parts.append(f"Тебя зовут {pet_name}.")
    if pet_character:
        context_parts.append(f"Ты сейчас выглядишь как {pet_character}.")
    if pet_stats:
        context_parts.append(f"Твоё состояние: {pet_stats}")
    if weather:
        weather_desc = ""
        if weather == "rn":
            weather_desc = "На улице идёт дождь."
        elif weather == "snw":
            weather_desc = "На улице идёт снег."
        else:
            weather_desc = "На улице ясно."
        context_parts.append(weather_desc)
    
    system_extra = " ".join(context_parts)
    
    try:
        answer = ask_ollama(prompt, system_extra)
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error in generate_text: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))