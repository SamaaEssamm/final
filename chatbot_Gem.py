import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

# Load the full rules text

base_dir = os.path.dirname(os.path.abspath(__file__))
rules_file = os.path.join(base_dir, "Internal_Regulation_EN.txt")
rules_text = open(rules_file, encoding="utf-8").read()


def ask_rule_question(question):
    prompt = f"""
You are a university assistant. :

{rules_text}

Question: {question}

"""
    response = model.generate_content(prompt)
    return response.text.strip()

# Example usage:
#print(ask_rule_question("my GPA is 3.77, what's the letter for that?"))