import re
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from ..models.chatbot import ChatMessage


class ChatbotUtils:
    """Utility functions for chatbot operations"""
    
    @staticmethod
    def sanitize_message(message: str) -> str:
        """Sanitize user input message"""
        # Remove excessive whitespace
        message = re.sub(r'\s+', ' ', message.strip())
        
        # Remove potentially harmful characters (basic sanitization)
        message = re.sub(r'[<>{}\\]', '', message)
        
        # Limit message length
        max_length = 2000
        if len(message) > max_length:
            message = message[:max_length] + "..."
        
        return message
    
    @staticmethod
    def extract_rwh_context(message: str) -> Dict[str, Any]:
        """Extract RWH-specific context from user message"""
        context = {
            "mentions_roof": False,
            "mentions_area": False,
            "mentions_rainfall": False,
            "mentions_storage": False,
            "mentions_cost": False,
            "mentions_maintenance": False,
            "area_value": None,
            "rainfall_value": None
        }
        
        # Check for RWH-related keywords
        rwh_keywords = {
            "mentions_roof": ["roof", "rooftop", "terrace", "building top"],
            "mentions_area": ["area", "square", "sq ft", "sq m", "size"],
            "mentions_rainfall": ["rain", "rainfall", "precipitation", "monsoon"],
            "mentions_storage": ["storage", "tank", "container", "capacity"],
            "mentions_cost": ["cost", "price", "budget", "money", "expensive"],
            "mentions_maintenance": ["maintenance", "cleaning", "upkeep", "service"]
        }
        
        message_lower = message.lower()
        
        for context_key, keywords in rwh_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                context[context_key] = True
        
        # Extract numerical values for area and rainfall
        area_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:sq\s*ft|square\s*feet|sq\s*m|square\s*meters?)', message_lower)
        if area_match:
            context["area_value"] = float(area_match.group(1))
        
        rainfall_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:inch|inches|mm|millimeters?|cm|centimeters?)', message_lower)
        if rainfall_match:
            context["rainfall_value"] = float(rainfall_match.group(1))
        
        return context
    
    @staticmethod
    def generate_rwh_suggestions(context: Dict[str, Any]) -> List[str]:
        """Generate contextual RWH suggestions based on extracted context"""
        suggestions = []
        
        if context["mentions_roof"] and not context["mentions_area"]:
            suggestions.append("Consider measuring your roof area to calculate potential water collection.")
        
        if context["mentions_area"] and context["area_value"]:
            area = context["area_value"]
            if area < 1000:
                suggestions.append("For smaller roofs, focus on simple collection systems with basic filtration.")
            elif area > 2000:
                suggestions.append("With a large roof area, you can implement advanced systems with multiple tanks.")
        
        if context["mentions_rainfall"] and not context["mentions_storage"]:
            suggestions.append("Don't forget to calculate appropriate storage capacity based on your rainfall data.")
        
        if context["mentions_cost"]:
            suggestions.append("Consider starting with a basic system and gradually upgrading components.")
        
        if context["mentions_maintenance"]:
            suggestions.append("Regular maintenance includes cleaning gutters, checking filters, and testing water quality.")
        
        if not any(context[key] for key in ["mentions_roof", "mentions_area", "mentions_rainfall"]):
            suggestions.append("I can help you with roof area calculations, storage sizing, or filtration methods.")
        
        return suggestions
    
    @staticmethod
    def format_conversation_export(messages: List[ChatMessage]) -> str:
        """Format conversation for export"""
        export_data = {
            "export_date": datetime.now().isoformat(),
            "conversation": []
        }
        
        for msg in messages:
            export_data["conversation"].append({
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
            })
        
        return json.dumps(export_data, indent=2)
    
    @staticmethod
    def calculate_rwh_metrics(roof_area_sqft: float, annual_rainfall_inches: float) -> Dict[str, float]:
        """Calculate basic RWH metrics"""
        # Convert units and calculate collection potential
        # Formula: Collection (gallons) = Roof Area (sq ft) × Rainfall (inches) × 0.623 × Efficiency Factor
        efficiency_factor = 0.8  # 80% efficiency accounting for losses
        
        annual_collection_gallons = roof_area_sqft * annual_rainfall_inches * 0.623 * efficiency_factor
        annual_collection_liters = annual_collection_gallons * 3.78541  # Convert to liters
        
        # Monthly average
        monthly_collection_gallons = annual_collection_gallons / 12
        
        # Storage recommendations (typically 30-40% of annual collection)
        recommended_storage_gallons = annual_collection_gallons * 0.35
        
        return {
            "annual_collection_gallons": round(annual_collection_gallons, 2),
            "annual_collection_liters": round(annual_collection_liters, 2),
            "monthly_collection_gallons": round(monthly_collection_gallons, 2),
            "recommended_storage_gallons": round(recommended_storage_gallons, 2),
            "recommended_storage_liters": round(recommended_storage_gallons * 3.78541, 2)
        }
    
    @staticmethod
    def validate_api_key(api_key: str) -> bool:
        """Basic API key validation"""
        if not api_key or api_key == "your_groq_api_key_here":
            return False
        
        # Basic format check for Groq API keys
        if len(api_key) < 20:
            return False
        
        return True
    
    @staticmethod
    def get_model_info(model_name: str) -> Dict[str, Any]:
        """Get information about available models"""
        models = {
            "llama3-8b-8192": {
                "description": "Fast and efficient model, good for general conversations",
                "context_length": 8192,
                "speed": "fast",
                "quality": "good"
            },
            "llama3-70b-8192": {
                "description": "More powerful model with better reasoning",
                "context_length": 8192,
                "speed": "moderate",
                "quality": "excellent"
            },
            "mixtral-8x7b-32768": {
                "description": "Balanced model with large context window",
                "context_length": 32768,
                "speed": "moderate",
                "quality": "very good"
            }
        }
        
        return models.get(model_name, {
            "description": "Unknown model",
            "context_length": 8192,
            "speed": "unknown",
            "quality": "unknown"
        })
