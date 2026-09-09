"use client";

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking() {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

export function speak(text: string) {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-HK";
  u.rate = 0.92;
  u.pitch = 1.08;
  const voices = window.speechSynthesis.getVoices();
  const match =
    voices.find((v) => v.lang === "zh-HK") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("zh-tw")) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("zh"));
  if (match) u.voice = match;
  window.speechSynthesis.speak(u);
}
