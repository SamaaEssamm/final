from googletrans import Translator

translator = Translator()

with open("Internal_Regulation_2011_new.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Split into smaller chunks
chunk_size = 500
chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

translated_chunks = []

for i, chunk in enumerate(chunks):
    if not chunk.strip():
        continue
    try:
        translated = translator.translate(chunk, src='ar', dest='en').text
        translated_chunks.append(translated)
        print(f"✅ Chunk {i+1} translated")
    except Exception as e:
        print(f"❌ Chunk {i+1} error: {e}")

# Save result
with open("Internal_Regulation_EN.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(translated_chunks))

print("✅ Done: Translated successfully.")
