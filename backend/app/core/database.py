"""
Database connection module using Supabase client.
"""
from supabase import create_client, Client
from app.core.config import settings

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Get or create a Supabase client instance."""
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in environment variables. "
                "Get these from your Supabase project dashboard."
            )
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client
