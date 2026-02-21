---
title: "I Built a Cheating App in an Afternoon — And That's the Point"
date: "2026-02-20"
excerpt: "A voice-triggered screenshot-to-LLM pipeline that answers anything on your screen. Building it took 4 hours. Stopping it is basically impossible."
---

Let me describe an app I built recently. You run it in the background. Any time you say the word **"bacon"** out loud, it silently takes a screenshot, ships the image to a vision-capable LLM, and reads the answer back to you through your earpiece — all in under three seconds.

I'm going to show you exactly how it works. And then I'm going to explain why it means the modern conception of "academic integrity enforcement" is largely theater.

## How It Works

The stack is intentionally small. Three components:

1. **Wake word detection** — listens for a trigger word locally, never hits the network
2. **Screenshot capture** — grabs whatever is on screen the moment the word fires
3. **Vision LLM call** — sends the image and a prompt, streams the response back

### Wake Word Detection

[Porcupine by Picovoice](https://picovoice.ai/products/porcupine/) runs entirely on-device. It listens for a custom wake word with near-zero CPU usage and zero audio leaving your machine. Free tier covers personal use.

```python
import pvporcupine
import pyaudio
import struct

porcupine = pvporcupine.create(
    access_key="YOUR_KEY",
    keywords=["computer"]  # or a custom "bacon" model
)

pa = pyaudio.PyAudio()
stream = pa.open(
    rate=porcupine.sample_rate,
    channels=1,
    format=pyaudio.paInt16,
    input=True,
    frames_per_buffer=porcupine.frame_length,
)

while True:
    pcm = stream.read(porcupine.frame_length, exception_on_overflow=False)
    pcm = struct.unpack_from("h" * porcupine.frame_length, pcm)
    if porcupine.process(pcm) >= 0:
        on_wake_word()  # 🔥 triggered
```

### Screenshot Capture

```python
import base64
from PIL import ImageGrab

def capture_screenshot() -> str:
    img = ImageGrab.grab()
    img = img.resize((1280, 720))  # keep tokens reasonable
    
    from io import BytesIO
    buf = BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()
```

### Vision LLM Call

```python
from openai import OpenAI

client = OpenAI()

def ask_llm(b64_image: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Look at this screenshot. Answer whatever question "
                            "or problem is visible. Be concise and direct."
                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{b64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=500,
    )
    return response.choices[0].message.content
```

### Putting It Together

```python
import pyttsx3

engine = pyttsx3.init()
engine.setProperty("rate", 200)

def on_wake_word():
    image_b64 = capture_screenshot()
    answer = ask_llm(image_b64)
    engine.say(answer)
    engine.runAndWait()
```

Total: ~80 lines of Python. Built and tested in an afternoon. Works on any OS.

---

## Now Let's Talk About What This Actually Means

I'm not writing this to help anyone cheat on an exam. I'm writing it because I think the people designing "AI-proof" academic environments are solving the wrong problem — and they deserve to understand why their tools don't work.

### The Detection Arms Race Is Already Over

Lockdown browsers block other tabs. Great. This app never opens a tab — it reads the screen directly.

AI detectors flag ChatGPT prose. Sure. This answer came through text-to-speech into your ear, never touched a text box.

Plagiarism checkers look for lifted sentences. Fine. The LLM synthesizes a novel answer every single time.

You can ban phones. You cannot ban a $30 Bluetooth earpiece that looks like a hearing aid.

You can monitor network traffic. You cannot monitor audio that never leaves a local wake-word model.

Every technical countermeasure assumes the cheater is unsophisticated. A creative person with basic programming skills can route around every single one of them.

### The Only Enforcement That Works

One thing stops this: **a human in the room, watching you write with a physical pen on physical paper they provided.**

That's it. No software solution. No browser extension. No AI detector. Proctored, handwritten, in-person, on paper they supply. That's the only threat model that closes the loop.

Everything else — online exams, take-home tests, "AI-proof" prompts, plagiarism tools — is predicated on the assumption that students won't go to the trouble of building something like what I described above. Some won't. But the threshold gets lower every month as the tools get easier, cheaper, and more capable.

### What Should Actually Change

The honest answer is that most multiple-choice tests and problem sets were never really measuring deep understanding to begin with. They were measuring the ability to recall and apply a procedure under time pressure. AI doesn't just cheat those assessments — it *exposes* that they were always a proxy metric.

The assessments worth defending are the ones where **the process is the point** — a live whiteboard interview, a design critique, a debate, a defended thesis. Those can't be cheated with a wake word and a screenshot. Everything else should probably be redesigned anyway.

---

I'm not celebrating this. The tool I built is a parlor trick with serious implications. But pretending the problem isn't real — or that another browser lockdown will fix it — isn't serious either.

The bacon is out of the bag.
