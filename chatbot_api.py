from flask import Flask, request, jsonify
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.schema import Document
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
groq_key = os.getenv("GROQ_API_KEY")
if not groq_key:
    raise ValueError("GROQ_API_KEY is not set in .env!")

os.environ["GROQ_API_KEY"] = groq_key


embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

vectordb = Chroma(
    persist_directory="./school_index",
    embedding_function=embedding_model
)

llm = ChatGroq(
    groq_api_key=os.environ["GROQ_API_KEY"],
    model_name="llama3-8b-8192"
)

app = Flask(__name__)


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def ask_question_with_rerank(query, top_k=8, final_k=3):
    retriever = vectordb.as_retriever(search_type="mmr", search_kwargs={"k": top_k})
    docs = retriever.get_relevant_documents(query)

   
    query_embedding = embedding_model.embed_query(query)

 
    scored_docs = []
    for doc in docs:
        doc_embedding = embedding_model.embed_query(doc.page_content)
        score = cosine_similarity(query_embedding, doc_embedding)
        scored_docs.append((score, doc))

 
    top_docs = [doc for _, doc in sorted(scored_docs, key=lambda x: x[0], reverse=True)[:final_k]]
    rerank_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True
    )

    result = rerank_chain.combine_documents_chain.run(
        {"input_documents": top_docs, "question": query}
    )
    return result
