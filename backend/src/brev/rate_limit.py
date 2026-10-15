import ipaddress
import math
import time
from typing import Any

from fastapi import Depends, HTTPException, Request, status
from limits import parse_many
from limits.storage import MemoryStorage
from limits.strategies import MovingWindowRateLimiter

# Counters live in memory, which is enough for the single process the app runs in.
# Several workers or replicas would need a shared storage such as Redis.
limiter = MovingWindowRateLimiter(MemoryStorage())


def client_key(request: Request) -> str:
    # request.client is already the real client: uvicorn only takes it from
    # X-Forwarded-For when the request comes from a trusted proxy.
    host = request.client.host if request.client else ""
    try:
        address = ipaddress.ip_address(host)
    except ValueError:
        return host

    if isinstance(address, ipaddress.IPv6Address):
        if address.ipv4_mapped:
            return str(address.ipv4_mapped)
        # A single IPv6 user usually owns a whole /64 and can rotate within it.
        return str(ipaddress.ip_network(f"{address}/64", strict=False))
    return str(address)


def rate_limit(scope: str, spec: str) -> Any:
    """Dependency allowing each client `spec` requests (e.g. "10/minute;100/day") in `scope`."""
    limits = parse_many(spec)

    def check(request: Request) -> None:
        key = client_key(request)
        for limit in limits:
            if not limiter.hit(limit, scope, key):
                reset_at = limiter.get_window_stats(limit, scope, key).reset_time
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests",
                    headers={"Retry-After": str(max(1, math.ceil(reset_at - time.time())))},
                )

    return Depends(check)
