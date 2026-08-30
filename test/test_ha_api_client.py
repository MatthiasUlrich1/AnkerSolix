"""Unit tests for IoBrokerAnkerApiClient helpers."""

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

PYTHON_DIR = Path(__file__).resolve().parents[1] / "python"
if str(PYTHON_DIR) not in sys.path:
    sys.path.insert(0, str(PYTHON_DIR))

from ha_api_client import IoBrokerAnkerApiClient  # noqa: E402


def _minimal_config(**overrides) -> dict:
    base = {
        "username": "user@example.com",
        "password": "secret",
        "country": "DE",
        "cacheDir": str(PYTHON_DIR / "authcache"),
        "enableEnergyStatisticsWeek": True,
        "enableEnergyStatisticsMonth": True,
        "enableEnergyStatisticsYear": True,
    }
    base.update(overrides)
    return base


@pytest.fixture
def client() -> IoBrokerAnkerApiClient:
    session = MagicMock()
    logger = MagicMock()
    return IoBrokerAnkerApiClient(_minimal_config(), session, logger)


def test_client_stores_config(client: IoBrokerAnkerApiClient) -> None:
    assert client.config is not None
    assert client.config.get("username") == "user@example.com"


def test_stuck_startup_state_still_fetches_daily_energy(
    client: IoBrokerAnkerApiClient,
) -> None:
    """startup=true and deferred_data=true must not skip daily energy forever."""
    client._startup = True
    client.deferred_data = True
    client._intervalcount = 0
    client.config["enableEnergyStatistics"] = True
    client.api.update_sites = AsyncMock(return_value=None)  # type: ignore[method-assign]
    client.api.update_device_details = AsyncMock(return_value=None)  # type: ignore[method-assign]
    client.api.update_site_details = AsyncMock(return_value=None)  # type: ignore[method-assign]
    client.api.update_device_energy = AsyncMock(return_value=None)  # type: ignore[method-assign]
    client.api.getCaches = MagicMock(return_value={})  # type: ignore[method-assign]
    client.api.sites = {"s1": {"energy_details": {"today": {"solar_production": "1.2"}}}}
    client.api.mqttsession = None
    client._refresh_power_limits = AsyncMock(return_value=None)  # type: ignore[method-assign]

    import asyncio

    result = asyncio.run(client.async_get_data())

    client.api.update_device_energy.assert_called_once()
    assert result["dailyEnergyFetched"] is True
    assert result["dailyEnergyHasValues"] is True
    assert client._startup is False


def test_period_rotation_fetches_one_period_at_a_time(
    client: IoBrokerAnkerApiClient,
) -> None:
    first = client._periods_for_this_refresh()
    second = client._periods_for_this_refresh()
    third = client._periods_for_this_refresh()
    assert len(first) == 1
    assert len(second) == 1
    assert len(third) == 1
    assert first != second != third
