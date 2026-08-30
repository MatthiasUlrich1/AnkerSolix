"""Unit tests for statistics device placement."""

import sys
from pathlib import Path

PYTHON_DIR = Path(__file__).resolve().parents[1] / "python"
if str(PYTHON_DIR) not in sys.path:
    sys.path.insert(0, str(PYTHON_DIR))

from energy_statistics import (  # noqa: E402
    build_site_combiner_device_present,
    build_site_has_combiner,
    device_exposes_energy_statistics,
)


def test_combiner_site_only_combiner_gets_statistics() -> None:
    caches = {
        "site1": {"type": "system", "site_id": "site1"},
        "CB1": {"type": "combiner_box", "site_id": "site1"},
        "SB1": {"type": "solarbank", "site_id": "site1"},
        "SB2": {"type": "solarbank", "site_id": "site1"},
    }
    has = build_site_has_combiner(caches)
    present = build_site_combiner_device_present(caches)
    assert has["site1"] is True
    assert present["site1"] is True
    assert device_exposes_energy_statistics(
        "combiner_box", True, enable_stats=True, combiner_device_present=True
    )
    assert not device_exposes_energy_statistics(
        "solarbank", True, enable_stats=True, combiner_device_present=True
    )
    assert not device_exposes_energy_statistics(
        "system", True, enable_stats=True, combiner_device_present=True
    )


def test_combiner_site_without_device_falls_back_to_solarbank() -> None:
    caches = {
        "site1": {
            "type": "system",
            "site_id": "site1",
            "combiner_box_info": {"combiner_box_list": [{"device_sn": "CB1"}]},
        },
        "SB1": {"type": "solarbank", "site_id": "site1"},
    }
    has = build_site_has_combiner(caches)
    present = build_site_combiner_device_present(caches)
    assert has["site1"] is True
    assert "site1" not in present
    assert not device_exposes_energy_statistics(
        "combiner_box", True, enable_stats=True, combiner_device_present=False
    )
    assert device_exposes_energy_statistics(
        "solarbank", True, enable_stats=True, combiner_device_present=False
    )


def test_standalone_site_solarbanks_get_statistics() -> None:
    caches = {
        "site2": {"type": "system", "site_id": "site2"},
        "SB1": {"type": "solarbank", "site_id": "site2"},
    }
    has = build_site_has_combiner(caches)
    assert "site2" not in has
    assert device_exposes_energy_statistics("solarbank", False, enable_stats=True)
    assert not device_exposes_energy_statistics("system", False, enable_stats=True)
