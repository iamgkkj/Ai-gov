import os
import google.generativeai as genai
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough

# Load environment variables
load_dotenv()

# Set Gemini API key
api_key = os.getenv("OPENAI_API_KEY")  # Using the same env var name for compatibility
if not api_key:
    print("Warning: No Gemini API key found. Set OPENAI_API_KEY in your .env file.")
genai.configure(api_key=api_key)

# Initialize LangChain LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.2, google_api_key=api_key)

# Define prompt templates
summarization_template = PromptTemplate(
    input_variables=["proposal"],
    template="""You are an AI assistant for a DAO governance platform. Summarize the following proposal in a concise TL;DR format (max 2 sentences):

{proposal}

TL;DR: """
)

risk_scoring_template = PromptTemplate(
    input_variables=["proposal"],
    template="""You are an AI assistant for a DAO governance platform. Analyze the following proposal and assign a risk score from 1-10 (where 1 is lowest risk and 10 is highest risk). Consider financial, technical, and governance risks. Provide a brief explanation for your score.

{proposal}

Risk Score (1-10): 
Explanation: """
)

categorization_template = PromptTemplate(
    input_variables=["proposal"],
    template="""You are an AI assistant for a DAO governance platform. Categorize the following proposal into one of these categories: Finance, Community, Protocol, Governance, Technical, Marketing, or Other. Provide a brief explanation for your categorization.

{proposal}

Category: 
Explanation: """
)

delegate_voting_template = PromptTemplate(
    input_variables=["proposal", "preferences"],
    template="""You are an AI delegate for a DAO governance platform. Based on the user's preferences and the proposal details, determine how the user would likely vote (For or Against). Provide your confidence level (0-100%) and reasoning.

Proposal:
{proposal}

User Preferences:
{preferences}

Vote (For/Against): 
Confidence (%): 
Reasoning: """
)

# Create LangChain runnable sequences
summarization_chain = RunnablePassthrough.assign(prompt=lambda x: summarization_template.format(**x)) | llm
risk_scoring_chain = RunnablePassthrough.assign(prompt=lambda x: risk_scoring_template.format(**x)) | llm
categorization_chain = RunnablePassthrough.assign(prompt=lambda x: categorization_template.format(**x)) | llm
delegate_voting_chain = RunnablePassthrough.assign(prompt=lambda x: delegate_voting_template.format(**x)) | llm


class AIService:
    @staticmethod
    async def analyze_proposal(proposal_text):
        """Analyze a proposal using Gemini API directly"""
        try:
            # Generate summary
            summary_model = genai.GenerativeModel('gemini-pro')
            summary_response = await summary_model.generate_content_async(
                """You are an AI assistant for a DAO governance platform. Summarize the following proposal in a concise TL;DR format (max 2 sentences).
                
                Proposal: """ + proposal_text
            )
            summary = summary_response.text.strip()
            
            # Generate risk score
            risk_model = genai.GenerativeModel('gemini-pro')
            risk_response = await risk_model.generate_content_async(
                """You are an AI assistant for a DAO governance platform. Analyze the following proposal and assign a risk score from 1-10 (where 1 is lowest risk and 10 is highest risk). Return only the numeric score.
                
                Proposal: """ + proposal_text
            )
            risk_score = int(risk_response.text.strip())
            
            # Generate category
            category_model = genai.GenerativeModel('gemini-pro')
            category_response = await category_model.generate_content_async(
                """You are an AI assistant for a DAO governance platform. Categorize the following proposal into one of these categories: Finance, Community, Protocol, Governance, Technical, Marketing, or Other. Return only the category name.
                
                Proposal: """ + proposal_text
            )
            category = category_response.text.strip()
            
            # Generate explanation
            explanation_model = genai.GenerativeModel('gemini-pro')
            explanation_response = await explanation_model.generate_content_async(
                f"""You are an AI assistant for a DAO governance platform. This proposal has been classified as {category} with a risk score of {risk_score}/10. Explain why this classification and risk score are appropriate in 2-3 sentences.
                
                Proposal: """ + proposal_text
            )
            explanation = explanation_response.text.strip()
            
            return {
                "summary": summary,
                "risk_score": risk_score,
                "category": category,
                "explanation": explanation
            }
            
        except Exception as e:
            print(f"Error in AI analysis: {str(e)}")
            # Provide fallback values in case of API failure
            return {
                "summary": "Failed to generate summary.",
                "risk_score": 5,  # Neutral risk score
                "category": "Other",
                "explanation": "AI analysis failed. Please review the proposal manually."
            }
    
    @staticmethod
    async def get_delegate_vote(proposal_text, user_preferences):
        """Determine how an AI delegate should vote based on user preferences"""
        try:
            # Format user preferences for the prompt
            preferences_text = f"Risk Tolerance: {user_preferences['risk_tolerance']}/10\n"
            preferences_text += f"Financial Priority: {user_preferences['prioritize_financial']}/5\n"
            preferences_text += f"Community Priority: {user_preferences['prioritize_community']}/5\n"
            preferences_text += f"Protocol Priority: {user_preferences['prioritize_protocol']}/5\n"
            preferences_text += f"Voting Strategy: {user_preferences['voting_strategy']}\n"
            
            if user_preferences.get('custom_rules'):
                preferences_text += f"Custom Rules: {user_preferences['custom_rules']}"
            
            # Get vote recommendation
            vote_model = genai.GenerativeModel('gemini-pro')
            vote_response = await vote_model.generate_content_async(
                """You are an AI delegate for a DAO governance platform. Based on the user's preferences and the proposal details, determine how the user would likely vote. Return only 'For' or 'Against'.
                
                Proposal:
                """ + proposal_text + """
                
                User Preferences:
                """ + preferences_text
            )
            vote = vote_response.text.strip()
            
            # Get confidence level
            confidence_model = genai.GenerativeModel('gemini-pro')
            confidence_response = await confidence_model.generate_content_async(
                """You are an AI delegate for a DAO governance platform. Based on the user's preferences and the proposal details, determine your confidence level (0-100%) in your vote recommendation. Return only the numeric percentage.
                
                Proposal:
                """ + proposal_text + """
                
                User Preferences:
                """ + preferences_text + """
                
                Vote: """ + vote
            )
            confidence = int(confidence_response.text.strip().replace('%', ''))
            
            # Get reasoning
            reasoning_model = genai.GenerativeModel('gemini-pro')
            reasoning_response = await reasoning_model.generate_content_async(
                f"""You are an AI delegate for a DAO governance platform. Explain why you recommended voting '{vote}' on this proposal with {confidence}% confidence, based on the user's preferences.
                
                Proposal:
                """ + proposal_text + """
                
                User Preferences:
                """ + preferences_text
            )
            reasoning = reasoning_response.text.strip()
            
            return {
                "vote": vote,
                "confidence": confidence,
                "reasoning": reasoning
            }
            
        except Exception as e:
            print(f"Error in delegate vote analysis: {str(e)}")
            # Provide fallback values in case of API failure
            return {
                "vote": "Abstain",
                "confidence": 0,
                "reasoning": "AI analysis failed. Please vote manually."
            }

    @staticmethod
    def analyze_proposal_sync(proposal_text):
        """Synchronous version using LangChain for testing"""
        try:
            # Generate summary
            summary_result = summarization_chain.invoke({"proposal": proposal_text})
            summary = summary_result.content
            
            # Generate risk score and explanation
            risk_result = risk_scoring_chain.invoke({"proposal": proposal_text})
            risk_output = risk_result.content
            risk_lines = risk_output.strip().split('\n')
            risk_score = int(risk_lines[0].replace('Risk Score (1-10):', '').strip())
            risk_explanation = risk_lines[1].replace('Explanation:', '').strip()
            
            # Generate category and explanation
            category_result = categorization_chain.invoke({"proposal": proposal_text})
            category_output = category_result.content
            category_lines = category_output.strip().split('\n')
            category = category_lines[0].replace('Category:', '').strip()
            category_explanation = category_lines[1].replace('Explanation:', '').strip()
            
            # Combine explanations
            explanation = f"{category_explanation} {risk_explanation}"
            
            return {
                "summary": summary,
                "risk_score": risk_score,
                "category": category,
                "explanation": explanation
            }
            
        except Exception as e:
            print(f"Error in AI analysis: {str(e)}")
            # Provide fallback values in case of API failure
            return {
                "summary": "Failed to generate summary.",
                "risk_score": 5,  # Neutral risk score
                "category": "Other",
                "explanation": "AI analysis failed. Please review the proposal manually."
            }