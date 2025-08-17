from flask import Flask, request, jsonify
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
import numpy as np
import voyageai
import os

VOYAGE_API_KEY = "key"
GROQ_API_KEY = "key"

client = voyageai.Client(api_key=VOYAGE_API_KEY)

# Custom Voyage wrapper
class VoyageEmbeddings:
    def embed_documents(self, texts):
        response = client.embed(
            texts=texts,
            model="voyage-3-lite",
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

# Load Chroma vector DB
vectordb = Chroma(
    persist_directory="./school_index",
    embedding_function=embedding_model
)

# LLM (Groq)
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama3-8b-8192"
)

app = Flask(__name__)

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Question answering with reranking
def ask_question_with_rerank(query, top_k=8, final_k=3):
    # Step 1: Retrieve candidate documents
    retriever = vectordb.as_retriever(search_type="mmr", search_kwargs={"k": top_k})
    docs = retriever.get_relevant_documents(query)

    if not docs:
        return "❌ Sorry, I couldn’t find anything relevant."

    # Step 2: Embed query + documents
    query_embedding = embedding_model.embed_query(query)
    doc_embeddings = embedding_model.embed_documents([doc.page_content for doc in docs])

    # Step 3: Score docs by cosine similarity
    scored_docs = []
    for doc, emb in zip(docs, doc_embeddings):
        score = cosine_similarity(query_embedding, emb)
        scored_docs.append((score, doc))

    # Step 4: Pick top reranked documents
    top_docs = [doc for _, doc in sorted(scored_docs, key=lambda x: x[0], reverse=True)[:final_k]]

    # Step 5: Build final context string for Groq
    context = "\n\n".join([doc.page_content for doc in top_docs])

    # Step 6: Ask Groq with context
    prompt = f"""
    You are a helpful assistant for university rules.
    Use ONLY the following context to answer the question.
    
    Context:
    {context}
    
    Question: {query}
    Answer:
    """
    response = llm.invoke(prompt)

    return response.content.strip()



