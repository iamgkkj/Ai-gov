from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, Float, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment or use a default for development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/aigov")

# Create SQLAlchemy engine with error handling
try:
    engine = create_engine(DATABASE_URL)
    # Test connection
    connection = engine.connect()
    connection.close()
    print("Database connection successful")
except Exception as e:
    print(f"Warning: Database connection failed - {str(e)}")
    print("Creating SQLite in-memory database for development")
    # Fallback to SQLite in-memory database
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for declarative models
Base = declarative_base()

# Define models
class User(Base):
    __tablename__ = "users"

    address = Column(String(42), primary_key=True, index=True)
    username = Column(String(100))
    email = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    delegate_preferences = relationship("DelegatePreferences", back_populates="user", uselist=False)
    votes = relationship("Vote", back_populates="user")
    delegate_history = relationship("DelegateVotingHistory", back_populates="user")


class DelegatePreferences(Base):
    __tablename__ = "delegate_preferences"

    address = Column(String(42), ForeignKey("users.address"), primary_key=True)
    is_active = Column(Boolean, default=False)
    risk_tolerance = Column(Integer)
    prioritize_financial = Column(Integer)
    prioritize_community = Column(Integer)
    prioritize_protocol = Column(Integer)
    voting_strategy = Column(String(50))
    custom_rules = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Constraints
    __table_args__ = (
        CheckConstraint("risk_tolerance BETWEEN 1 AND 10", name="check_risk_tolerance_range"),
        CheckConstraint("prioritize_financial BETWEEN 1 AND 5", name="check_financial_range"),
        CheckConstraint("prioritize_community BETWEEN 1 AND 5", name="check_community_range"),
        CheckConstraint("prioritize_protocol BETWEEN 1 AND 5", name="check_protocol_range"),
        CheckConstraint("voting_strategy IN ('conservative', 'balanced', 'progressive')", name="check_voting_strategy"),
    )

    # Relationships
    user = relationship("User", back_populates="delegate_preferences")


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, nullable=False)  # On-chain proposal ID
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    ipfs_hash = Column(String(100), nullable=False)
    proposer = Column(String(42), nullable=False, index=True)
    status = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'active', 'executed', 'rejected')", name="check_proposal_status"),
    )

    # Relationships
    analysis = relationship("ProposalAnalysis", back_populates="proposal", uselist=False)
    votes = relationship("Vote", back_populates="proposal")
    delegate_history = relationship("DelegateVotingHistory", back_populates="proposal")


class ProposalAnalysis(Base):
    __tablename__ = "proposal_analysis"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"))
    summary = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    risk_score = Column(Integer)
    ai_explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Constraints
    __table_args__ = (
        CheckConstraint("risk_score BETWEEN 1 AND 10", name="check_risk_score_range"),
    )

    # Relationships
    proposal = relationship("Proposal", back_populates="analysis")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), index=True)
    voter = Column(String(42), ForeignKey("users.address"), index=True)
    vote_type = Column(Boolean, nullable=False)  # TRUE for 'for', FALSE for 'against'
    is_delegate_vote = Column(Boolean, default=False)
    transaction_hash = Column(String(66))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    proposal = relationship("Proposal", back_populates="votes")
    user = relationship("User", back_populates="votes")


class DelegateVotingHistory(Base):
    __tablename__ = "delegate_voting_history"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String(42), ForeignKey("users.address"), index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"))
    user_vote = Column(Boolean)  # User's actual vote
    ai_recommendation = Column(Boolean)  # AI's recommended vote
    match = Column(Boolean)  # Whether they matched
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="delegate_history")
    proposal = relationship("Proposal", back_populates="delegate_history")


# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Function to initialize the database
def init_db():
    Base.metadata.create_all(bind=engine)