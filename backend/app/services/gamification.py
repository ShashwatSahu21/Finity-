"""
Gamification Service
Points, levels, badges, and streak tracking.
"""

# XP thresholds for levels
LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500]

# Action XP rewards
ACTION_XP = {
    "complete_lesson": 50,
    "complete_quiz": 30,
    "add_expense": 10,
    "set_goal": 25,
    "run_simulation": 20,
    "complete_risk_profile": 40,
    "check_loan_eligibility": 15,
    "daily_login": 10,
    "chat_session": 5,
    "streak_bonus_7": 50,
    "streak_bonus_30": 200,
}

# Badge definitions
BADGES = [
    {"id": "first_steps", "name": "First Steps", "description": "Complete your first lesson", "icon": "🎓", "xp_required": 0, "condition": "complete_1_lesson"},
    {"id": "budget_beginner", "name": "Budget Beginner", "description": "Track 10 expenses", "icon": "💰", "condition": "track_10_expenses"},
    {"id": "risk_aware", "name": "Risk Aware", "description": "Complete risk assessment", "icon": "🎯", "condition": "complete_risk_profile"},
    {"id": "goal_setter", "name": "Goal Setter", "description": "Create your first financial goal", "icon": "🏆", "condition": "set_1_goal"},
    {"id": "simulator_pro", "name": "Simulator Pro", "description": "Run 5 investment simulations", "icon": "📊", "condition": "run_5_simulations"},
    {"id": "week_warrior", "name": "Week Warrior", "description": "7-day login streak", "icon": "🔥", "condition": "streak_7"},
    {"id": "month_master", "name": "Month Master", "description": "30-day login streak", "icon": "⭐", "condition": "streak_30"},
    {"id": "scholar", "name": "Scholar", "description": "Complete all lessons", "icon": "📚", "condition": "complete_all_lessons"},
    {"id": "level_5", "name": "Rising Star", "description": "Reach level 5", "icon": "🌟", "condition": "reach_level_5"},
    {"id": "level_10", "name": "Finance Guru", "description": "Reach level 10", "icon": "👑", "condition": "reach_level_10"},
]


def calculate_level(total_xp: int) -> dict:
    """Calculate user level and progress from total XP."""
    level = 0
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if total_xp >= threshold:
            level = i
        else:
            break

    current_threshold = LEVEL_THRESHOLDS[level] if level < len(LEVEL_THRESHOLDS) else LEVEL_THRESHOLDS[-1]
    next_threshold = LEVEL_THRESHOLDS[level + 1] if level + 1 < len(LEVEL_THRESHOLDS) else current_threshold + 1500
    progress = ((total_xp - current_threshold) / (next_threshold - current_threshold)) * 100

    return {
        "level": level,
        "total_xp": total_xp,
        "current_threshold": current_threshold,
        "next_threshold": next_threshold,
        "progress_to_next": round(min(progress, 100), 1),
    }


def get_xp_for_action(action: str) -> int:
    """Get XP reward for a specific action."""
    return ACTION_XP.get(action, 0)


def get_all_badges() -> list[dict]:
    """Return all available badges."""
    return BADGES
