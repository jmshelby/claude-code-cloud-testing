"""
DiabetesCompanion Multi-Agent System - Phase 3

This package contains specialized agents for different aspects of diabetes management:
- EducationAgent: Diabetes knowledge and education
- TrackingAgent: Data logging and management
- AdvisoryAgent: Pattern analysis and personalized recommendations
- EmergencyAgent: Critical situation response

Each agent is designed with a specific responsibility to provide focused, expert assistance.
"""

from .education_agent import create_education_agent
from .tracking_agent import create_tracking_agent
from .advisory_agent import create_advisory_agent
from .emergency_agent import create_emergency_agent

__all__ = [
    "create_education_agent",
    "create_tracking_agent",
    "create_advisory_agent",
    "create_emergency_agent",
]
