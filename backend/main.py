from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import logging
from datetime import datetime

# Import our services
from database import get_db, init_db, User, DelegatePreferences, Proposal as DBProposal, ProposalAnalysis, Vote, DelegateVotingHistory
from ai_service import AIService
from ipfs_service import get_ipfs_service, get_ipfs_gateway_url
from blockchain_service import get_blockchain_service

from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("ai-gov")

# Initialize FastAPI app
app = FastAPI(
    title="AI-Gov API",
    description="API for AI-powered DAO governance platform",
    version="0.1.0",
)

# Initialize database tables
from database import init_db
init_db()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get services
ipfs_service = get_ipfs_service()
blockchain_service = get_blockchain_service()

# Initialize AI service
ai_service = AIService()

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()

# Pydantic models for API
class ProposalCreate(BaseModel):
    title: str
    description: str
    author_address: str

class ProposalResponse(BaseModel):
    id: int
    title: str
    ipfs_hash: str
    ipfs_url: str
    summary: str
    risk_score: int
    category: str
    author_address: str
    created_at: datetime
    on_chain_id: Optional[int] = None
    tx_hash: Optional[str] = None

class VoteCreate(BaseModel):
    proposal_id: int
    voter_address: str
    vote: bool  # True for yes, False for no
    delegate_vote: bool = False

class DelegatePreferencesCreate(BaseModel):
    user_address: str
    risk_tolerance: int = Field(..., ge=1, le=10)
    category_preferences: Dict[str, int]
    voting_strategy: str = Field(..., pattern='^(conservative|balanced|progressive)$')

class ErrorResponse(BaseModel):
    detail: str

# Error handler middleware
@app.middleware("http")
async def error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"},
        )

@app.post("/proposals", response_model=ProposalResponse, status_code=201)
async def create_proposal(
    proposal: ProposalCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        # Store full proposal content on IPFS
        proposal_data = {
            "title": proposal.title,
            "description": proposal.description,
            "author": proposal.author_address,
            "timestamp": datetime.now().isoformat()
        }
        ipfs_hash = await ipfs_service.add_json(proposal_data)
        ipfs_url = get_ipfs_gateway_url(ipfs_hash)
        
        # Perform AI analysis
        ai_analysis = await ai_service.analyze_proposal(proposal.title, proposal.description)
        
        # Create database entry
        db_proposal = DBProposal(
            title=proposal.title,
            ipfs_hash=ipfs_hash,
            author_address=proposal.author_address
        )
        db.add(db_proposal)
        db.flush()  # Get the ID without committing
        
        # Add analysis
        analysis = ProposalAnalysis(
            proposal_id=db_proposal.id,
            summary=ai_analysis["summary"],
            risk_score=ai_analysis["risk_score"],
            category=ai_analysis["category"],
            explanation=ai_analysis["explanation"]
        )
        db.add(analysis)
        db.commit()
        db.refresh(db_proposal)
        
        # Submit to blockchain in background to avoid blocking
        background_tasks.add_task(
            blockchain_service.submit_proposal,
            db_proposal.id,
            ipfs_hash,
            ai_analysis["summary"],
            ai_analysis["risk_score"],
            ai_analysis["category"],
            proposal.author_address
        )
        
        # Return response
        return ProposalResponse(
            id=db_proposal.id,
            title=db_proposal.title,
            ipfs_hash=ipfs_hash,
            ipfs_url=ipfs_url,
            summary=ai_analysis["summary"],
            risk_score=ai_analysis["risk_score"],
            category=ai_analysis["category"],
            author_address=db_proposal.author_address,
            created_at=db_proposal.created_at,
            # These will be updated later by a background task
            on_chain_id=None,
            tx_hash=None
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating proposal: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create proposal: {str(e)}")


@app.get("/proposals/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(proposal_id: int, db: Session = Depends(get_db)):
    # Get proposal from database
    proposal = db.query(DBProposal).filter(DBProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Get analysis
    analysis = db.query(ProposalAnalysis).filter(ProposalAnalysis.proposal_id == proposal_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Proposal analysis not found")
    
    # Get blockchain data if available
    on_chain_id = None
    tx_hash = None
    try:
        blockchain_data = await blockchain_service.get_proposal_data(proposal_id)
        if blockchain_data:
            on_chain_id = blockchain_data.get("on_chain_id")
            tx_hash = blockchain_data.get("tx_hash")
    except Exception as e:
        logger.warning(f"Could not fetch blockchain data for proposal {proposal_id}: {str(e)}")
    
    # Return response
    return ProposalResponse(
        id=proposal.id,
        title=proposal.title,
        ipfs_hash=proposal.ipfs_hash,
        ipfs_url=get_ipfs_gateway_url(proposal.ipfs_hash),
        summary=analysis.summary,
        risk_score=analysis.risk_score,
        category=analysis.category,
        author_address=proposal.author_address,
        created_at=proposal.created_at,
        on_chain_id=on_chain_id,
        tx_hash=tx_hash
    )

@app.get("/proposals", response_model=List[ProposalResponse])
async def list_proposals(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    # Get proposals from database
    proposals = db.query(DBProposal).offset(skip).limit(limit).all()
    
    # Build response
    result = []
    for proposal in proposals:
        analysis = db.query(ProposalAnalysis).filter(ProposalAnalysis.proposal_id == proposal.id).first()
        if not analysis:
            continue
        
        # Get blockchain data if available
        on_chain_id = None
        tx_hash = None
        try:
            blockchain_data = await blockchain_service.get_proposal_data(proposal.id)
            if blockchain_data:
                on_chain_id = blockchain_data.get("on_chain_id")
                tx_hash = blockchain_data.get("tx_hash")
        except Exception as e:
            logger.warning(f"Could not fetch blockchain data for proposal {proposal.id}: {str(e)}")
        
        result.append(ProposalResponse(
            id=proposal.id,
            title=proposal.title,
            ipfs_hash=proposal.ipfs_hash,
            ipfs_url=get_ipfs_gateway_url(proposal.ipfs_hash),
            summary=analysis.summary,
            risk_score=analysis.risk_score,
            category=analysis.category,
            author_address=proposal.author_address,
            created_at=proposal.created_at,
            on_chain_id=on_chain_id,
            tx_hash=tx_hash
        ))
    
    return result

@app.post("/votes", status_code=201)
async def create_vote(
    vote: VoteCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Check if proposal exists
    proposal = db.query(DBProposal).filter(DBProposal.id == vote.proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if user has already voted
    existing_vote = db.query(Vote).filter(
        Vote.proposal_id == vote.proposal_id,
        Vote.voter_address == vote.voter_address
    ).first()
    
    if existing_vote:
        raise HTTPException(status_code=400, detail="User has already voted on this proposal")
    
    # If it's a delegate vote, check if user has delegated
    if vote.delegate_vote:
        # Check if user has delegate preferences
        delegate_prefs = db.query(DelegatePreferences).filter(
            DelegatePreferences.user_address == vote.voter_address
        ).first()
        
        if not delegate_prefs:
            raise HTTPException(status_code=400, detail="User has not set up delegate preferences")
        
        # Get AI recommendation
        analysis = db.query(ProposalAnalysis).filter(ProposalAnalysis.proposal_id == vote.proposal_id).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Proposal analysis not found")
        
        # Get full proposal from IPFS
        try:
            proposal_data = await ipfs_service.get_json(proposal.ipfs_hash)
            description = proposal_data.get("description", "")
        except Exception as e:
            logger.error(f"Error fetching proposal from IPFS: {str(e)}")
            description = ""
        
        # Get AI recommendation
        recommendation = await ai_service.get_delegate_recommendation(
            proposal.title,
            description,
            analysis.summary,
            analysis.risk_score,
            analysis.category,
            delegate_prefs.risk_tolerance,
            delegate_prefs.category_preferences,
            delegate_prefs.voting_strategy
        )
        
        # Use AI recommendation
        vote_value = recommendation["vote"]
        vote_explanation = recommendation["explanation"]
    else:
        # Use user's vote
        vote_value = vote.vote
        vote_explanation = "User manual vote"
    
    # Create vote in database
    db_vote = Vote(
        proposal_id=vote.proposal_id,
        voter_address=vote.voter_address,
        vote=vote_value,
        delegate_vote=vote.delegate_vote,
        explanation=vote_explanation
    )
    db.add(db_vote)
    db.commit()
    
    # Submit to blockchain in background
    background_tasks.add_task(
        blockchain_service.submit_vote,
        vote.proposal_id,
        vote.voter_address,
        vote_value
    )
    
    # If it's a delegate vote, record in history
    if vote.delegate_vote:
        history = DelegateVotingHistory(
            user_address=vote.voter_address,
            proposal_id=vote.proposal_id,
            vote=vote_value,
            explanation=vote_explanation
        )
        db.add(history)
        db.commit()
    
    return {"success": True, "vote": vote_value, "explanation": vote_explanation}

@app.post("/delegate-preferences", status_code=201)
async def set_delegate_preferences(
    preferences: DelegatePreferencesCreate,
    db: Session = Depends(get_db)
):
    # Check if user already has preferences
    existing_prefs = db.query(DelegatePreferences).filter(
        DelegatePreferences.user_address == preferences.user_address
    ).first()
    
    if existing_prefs:
        # Update existing preferences
        existing_prefs.risk_tolerance = preferences.risk_tolerance
        existing_prefs.category_preferences = preferences.category_preferences
        existing_prefs.voting_strategy = preferences.voting_strategy
    else:
        # Create new preferences
        db_prefs = DelegatePreferences(
            user_address=preferences.user_address,
            risk_tolerance=preferences.risk_tolerance,
            category_preferences=preferences.category_preferences,
            voting_strategy=preferences.voting_strategy
        )
        db.add(db_prefs)
    
    db.commit()
    return {"success": True}

@app.get("/delegate-preferences/{user_address}")
async def get_delegate_preferences(user_address: str, db: Session = Depends(get_db)):
    prefs = db.query(DelegatePreferences).filter(
        DelegatePreferences.user_address == user_address
    ).first()
    
    if not prefs:
        raise HTTPException(status_code=404, detail="Delegate preferences not found")
    
    return {
        "user_address": prefs.user_address,
        "risk_tolerance": prefs.risk_tolerance,
        "category_preferences": prefs.category_preferences,
        "voting_strategy": prefs.voting_strategy
    }

@app.get("/delegate-history/{user_address}")
async def get_delegate_history(user_address: str, db: Session = Depends(get_db)):
    history = db.query(DelegateVotingHistory).filter(
        DelegateVotingHistory.user_address == user_address
    ).all()
    
    result = []
    for entry in history:
        proposal = db.query(DBProposal).filter(DBProposal.id == entry.proposal_id).first()
        if not proposal:
            continue
            
        result.append({
            "proposal_id": entry.proposal_id,
            "proposal_title": proposal.title,
            "vote": entry.vote,
            "explanation": entry.explanation,
            "timestamp": entry.created_at
        })
    
    return result

@app.get("/proposal-full/{proposal_id}")
async def get_full_proposal(proposal_id: int, db: Session = Depends(get_db)):
    # Get proposal from database
    proposal = db.query(DBProposal).filter(DBProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Get analysis
    analysis = db.query(ProposalAnalysis).filter(ProposalAnalysis.proposal_id == proposal_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Proposal analysis not found")
    
    # Get full proposal from IPFS
    try:
        proposal_data = await ipfs_service.get_json(proposal.ipfs_hash)
    except Exception as e:
        logger.error(f"Error fetching proposal from IPFS: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not fetch proposal data from IPFS")
    
    # Get blockchain data if available
    blockchain_data = {}
    try:
        blockchain_data = await blockchain_service.get_proposal_data(proposal_id) or {}
    except Exception as e:
        logger.warning(f"Could not fetch blockchain data for proposal {proposal_id}: {str(e)}")
    
    # Get votes
    votes = db.query(Vote).filter(Vote.proposal_id == proposal_id).all()
    vote_data = [{
        "voter_address": v.voter_address,
        "vote": v.vote,
        "delegate_vote": v.delegate_vote,
        "explanation": v.explanation,
        "timestamp": v.created_at
    } for v in votes]
    
    # Combine all data
    return {
        "id": proposal.id,
        "title": proposal.title,
        "author_address": proposal.author_address,
        "created_at": proposal.created_at,
        "ipfs_hash": proposal.ipfs_hash,
        "ipfs_url": get_ipfs_gateway_url(proposal.ipfs_hash),
        "full_description": proposal_data.get("description", ""),
        "analysis": {
            "summary": analysis.summary,
            "risk_score": analysis.risk_score,
            "category": analysis.category,
            "explanation": analysis.explanation
        },
        "blockchain": blockchain_data,
        "votes": {
            "total": len(votes),
            "yes": sum(1 for v in votes if v.vote),
            "no": sum(1 for v in votes if not v.vote),
            "details": vote_data
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": app.version}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)