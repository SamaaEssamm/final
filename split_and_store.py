# split_and_store.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
import voyageai
import os

# 🚀 Use your Voyage API key directly (or later use env var)
VOYAGE_API_KEY = "key"

client = voyageai.Client(api_key=VOYAGE_API_KEY)

# Load school rules file
with open("Internal_Regulation_EN.txt", "r", encoding="utf-8") as f:
    full_text = f.read()

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2500,
    chunk_overlap=300
)
docs = text_splitter.create_documents([full_text])

# Custom wrapper for Voyage embeddings
class VoyageEmbeddings:
    def embed_documents(self, texts):
        response = client.embed(
            texts=texts,
            model="voyage-3-lite",   # ✅ lightweight embedding model
            input_type="document"
        )
        return response.embeddings

    def embed_query(self, text):
        response = client.embed(
            texts=[text],
            model="voyage-3-lite",
            input_type="query"
        )
        return response.embeddings[0]

embedding_model = VoyageEmbeddings()

# Store in ChromaDB
db = Chroma.from_documents(
    docs,
    embedding=embedding_model,
    persist_directory="./school_index"
)
db.persist()

print("✅ Done: School rules indexed with Voyage embeddings.")
