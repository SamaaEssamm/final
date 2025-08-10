# split_and_store.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings

# Load your 70-page school rules
with open("Internal_Regulation_EN.txt", "r", encoding="utf-8") as f:
    full_text = f.read()

# Split it into chunks of ~1000 characters
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2500,
    chunk_overlap=300
)
docs = text_splitter.create_documents([full_text])

# Embed and store in local Chroma
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma.from_documents(docs, embedding=embeddings, persist_directory="./school_index")
db.persist()

print("✅ Done: School rules indexed successfully.")
