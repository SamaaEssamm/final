import google.generativeai as genai
import os

genai.configure(api_key="your_gemini_key")

model = genai.GenerativeModel("gemini-1.5-flash")

# Load the full rules text
rules_text = open("Internal_Regulation_EN.txt", encoding="utf-8").read()

def ask_rule_question(question):
    prompt = f"""
You are a university assistant. You must answer using only the following university rules:

{rules_text}

Question: {question}
Answer:
"""
    response = model.generate_content(prompt)
    return response.text.strip()

# Example usage:
#print(ask_rule_question("my GPA is 3.77, what's the letter for that?"))
