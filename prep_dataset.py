from groq import Groq
import json

client = Groq(api_key=":)")

rules_text = open("Internal_Regulation_EN.txt", "r", encoding="utf-8").read()

# Split into chunks (to avoid context length overflow)
chunks = [rules_text[i:i+2000] for i in range(0, len(rules_text), 2000)]

qa_dataset = []

for idx, chunk in enumerate(chunks):
    prompt = f"""
    You are a JSON generator. 
    Read the following section of university rules:

    {chunk}

    Generate exactly 5 question-answer pairs that a student might ask,
    and answer them **using only this text**.

    Output ONLY valid JSON, no extra text.
    Format:
    [
      {{"question": "QUESTION", "answer": "ANSWER", "context": "the exact chunk of text you used"}}
    ]
    """

    resp = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    raw_output = resp.choices[0].message.content.strip()

    # Try to "fix" if extra text before/after JSON
    if raw_output.startswith("```"):
        raw_output = raw_output.strip("```").replace("json", "").strip()

    try:
        qa_pairs = json.loads(raw_output)
        qa_dataset.extend(qa_pairs)
        print(f"✅ Chunk {idx+1}: {len(qa_pairs)} QAs added")
    except Exception as e:
        print(f"❌ Parse error on chunk {idx+1}, skipping...", e)
        print("Raw output was:", raw_output[:200], "...")
        continue

# Save dataset
with open("rules_qa.json", "w", encoding="utf-8") as f:
    json.dump(qa_dataset, f, indent=2, ensure_ascii=False)

print("🎉 Dataset ready with", len(qa_dataset), "QAs")
