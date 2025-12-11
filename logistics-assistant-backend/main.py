
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from dotenv import load_dotenv
from langchain_openai import OpenAI
from langchain.memory import ConversationBufferMemory
from langchain_core.runnables.history import RunnableWithMessageHistory

load_dotenv()

# Load the Cargo 2000 dataset
DATASET_PATH = "c2k_data_comma.csv"
cargo_df = pd.read_csv(DATASET_PATH)
cargo_df = cargo_df[pd.to_numeric(cargo_df['nr'], errors='coerce').notnull()]
cargo_df['nr'] = cargo_df['nr'].astype(int)

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# OpenAI API key from .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# LangChain OpenAI setup
llm = OpenAI(openai_api_key=OPENAI_API_KEY)

# In-memory store for session histories
session_histories = {}

def get_session_history(session_id: str):
    if session_id not in session_histories:
        session_histories[session_id] = ConversationBufferMemory()
    return session_histories[session_id]

# Use RunnableWithMessageHistory for conversation
chain = RunnableWithMessageHistory(
    llm,
    get_session_history=get_session_history,
    input_key="input",
    output_key="output"
)

class Query(BaseModel):
    message: str


def answer_query(query, session_id="default"):
    print("answer_query called with:", query)
    # Shipment status by nr (unique id)
    if "shipment" in query.lower() or "nr" in query.lower():
        print("Available shipment IDs:", pd.to_numeric(cargo_df['nr'], errors='coerce').dropna().astype(int).tolist())
        print("nr column dtype:", cargo_df['nr'].dtype)
        for word in query.split():
            if word.isdigit():
                nr = int(word)
                print("Searching for shipment nr:", nr)
                shipment = cargo_df[pd.to_numeric(cargo_df['nr'], errors='coerce').fillna(-1).astype(int) == nr]
                if not shipment.empty:
                    # ...
                    planned = shipment.iloc[0]['o_dlv_p']
                    actual = shipment.iloc[0]['o_dlv_e']
                    hops = shipment.iloc[0]['o_hops']
                    return (
                        f"Shipment {nr} info:\n"
                        f"- Planned delivery time: {planned} min\n"
                        f"- Actual delivery time: {actual} min\n"
                        f"- Number of outgoing hops: {hops}\n"
                    )
        return "Please provide a valid shipment nr (ID)."
    # Example: planned vs actual for all shipments
    elif "average delay" in query.lower():
        cargo_df['delay'] = cargo_df['o_dlv_e'] - cargo_df['o_dlv_p']
        avg_delay = cargo_df['delay'].mean()
        return f"Average delivery delay across all shipments: {avg_delay:.2f} minutes."
    # Example: how many shipments have more than X hops
    elif "hops" in query.lower():
        for word in query.split():
            if word.isdigit():
                num = int(word)
                count = (cargo_df['o_hops'] > num).sum()
                return f"Number of shipments with more than {num} outgoing hops: {count}"
        return "Please specify the number of hops."
    # Fallback to OpenAI LLM for complex/multi-step queries
    else:
        result = chain.invoke({"input": query}, config={"configurable": {"session_id": session_id}})
        return result["output"] if isinstance(result, dict) and "output" in result else str(result)

@app.post("/ask")
async def ask(query: Query, request: Request):
    print("Received /ask request with message:", query.message)
    # Use client IP as a simple session_id (for demo; in production use a better session mechanism)
    session_id = request.client.host
    answer = answer_query(query.message, session_id=session_id)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    