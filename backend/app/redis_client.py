import redis
from redis import Redis

from app.config import REDIS_URL

redis_client: Redis = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
)

POSTS_CACHE_KEY = "posts:public"
POSTS_CACHE_TTL = 60